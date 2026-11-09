import * as oauth from 'oauth4webapi';
import { AppError } from './errors';

export const CLIENT_ID =
  import.meta.env.MODE === 'production'
    ? 'a5491fb2-111a-4c43-976c-280a507814dc'
    : '07171723-a302-4e3c-875d-197490f956eb';
export const SCOPES = 'openid profile offline_access https://graph.microsoft.com/Tasks.ReadWrite';
const SESSION_KEY = 'v2:auth';
const TRANSACTION_KEY = 'v2:authorization';
const MICROSOFT = 'https://login.microsoftonline.com';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const client: oauth.Client = { client_id: CLIENT_ID, id_token_signed_response_alg: 'RS256' };

export interface Account {
  id: string;
  name: string;
  username: string;
  tenantId: string;
}
interface Session {
  account: Account;
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
}
interface Transaction {
  state: string;
  nonce: string;
  verifier: string;
  createdAt: number;
}
let loginFlight: Promise<Account> | undefined;
let refreshFlight: Promise<Session> | undefined;
let generation = 0;

/** 读取可信会话存储，完整凭据仅在后台模块内部流转，喵~ */
async function readSession(): Promise<Session | undefined> {
  return (await chrome.storage.session.get(SESSION_KEY))[SESSION_KEY] as Session | undefined;
}

/** 从微软固定域名取得租户元数据，并限制后续协议请求的目的地，喵~ */
async function metadata(tenant: string): Promise<oauth.AuthorizationServer> {
  if (tenant !== 'common' && !UUID.test(tenant)) throw new AppError('auth_invalid');
  const issuer = `${MICROSOFT}/${tenant}/v2.0`;
  const response = await fetch(`${issuer}/.well-known/openid-configuration`, {
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new AppError('network');
  const value = (await response.json()) as oauth.AuthorizationServer;
  const expected = tenant === 'common' ? `${MICROSOFT}/{tenantid}/v2.0` : issuer;
  if (value.issuer !== expected) throw new AppError('auth_invalid');
  for (const url of [value.authorization_endpoint, value.token_endpoint, value.jwks_uri]) {
    if (!url || new URL(url).origin !== MICROSOFT) throw new AppError('auth_invalid');
  }
  return { ...value, issuer };
}

/** 未验证的租户声明只用于选择微软域名下的校验元数据，绝不作为登录身份，喵~ */
function tenantHint(token: string): string {
  try {
    const payload = token.split('.')[1];
    if (!payload) throw new Error();
    const tid: unknown = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/'))).tid;
    if (typeof tid !== 'string' || !UUID.test(tid)) throw new Error();
    return tid;
  } catch {
    throw new AppError('auth_invalid');
  }
}

/** 协议异常只保留微软错误编号或标准错误名，不暴露原始回调和令牌，喵~ */
function authError(error: unknown): AppError {
  if (error instanceof AppError) return error;
  if (
    error instanceof TypeError ||
    (error instanceof DOMException && ['AbortError', 'TimeoutError'].includes(error.name))
  )
    return new AppError('network');
  if (error instanceof oauth.ResponseBodyError || error instanceof oauth.AuthorizationResponseError) {
    const code = error.error;
    return new AppError(
      ['login_required', 'interaction_required', 'invalid_grant', 'consent_required'].includes(code)
        ? 'auth_required'
        : 'configuration',
      code,
    );
  }
  return new AppError('auth_invalid');
}

/** 登录前记录 PKCE 事务，通过身份窗口取得授权码后校验 nonce、受众、发行方与签名，喵~ */
async function performLogin(): Promise<Account> {
  const currentGeneration = generation;
  const as = await metadata('common');
  const tx: Transaction = {
    state: oauth.generateRandomState(),
    nonce: oauth.generateRandomNonce(),
    verifier: oauth.generateRandomCodeVerifier(),
    createdAt: Date.now(),
  };
  await chrome.storage.session.set({ [TRANSACTION_KEY]: tx });
  try {
    const redirectUri = chrome.identity.getRedirectURL();
    const url = new URL(as.authorization_endpoint!);
    url.search = new URLSearchParams({
      client_id: CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: 'code',
      response_mode: 'query',
      scope: SCOPES,
      state: tx.state,
      nonce: tx.nonce,
      code_challenge: await oauth.calculatePKCECodeChallenge(tx.verifier),
      code_challenge_method: 'S256',
      prompt: 'select_account',
    }).toString();
    let callback: string | undefined;
    try {
      callback = await chrome.identity.launchWebAuthFlow({ url: url.href, interactive: true });
    } catch {
      throw new AppError('auth_cancelled');
    }
    if (!callback) throw new AppError('auth_cancelled');
    const returned = new URL(callback);
    const expected = new URL(redirectUri);
    if (
      returned.origin !== expected.origin ||
      returned.pathname !== expected.pathname ||
      Date.now() - tx.createdAt > 15 * 60_000
    )
      throw new AppError('auth_invalid');
    const params = oauth.validateAuthResponse(as, client, returned, tx.state);
    const response = await oauth.authorizationCodeGrantRequest(
      as,
      client,
      oauth.None(),
      params,
      redirectUri,
      tx.verifier,
      { signal: AbortSignal.timeout(20_000) },
    );
    if (!response.ok) {
      await oauth.processAuthorizationCodeResponse(as, client, response);
      throw new AppError('auth_invalid');
    }
    const body = (await response.clone().json()) as { id_token?: string };
    if (!body.id_token) throw new AppError('auth_invalid');
    const tenantAs = await metadata(tenantHint(body.id_token));
    const token = await oauth.processAuthorizationCodeResponse(tenantAs, client, response, {
      expectedNonce: tx.nonce,
      requireIdToken: true,
    });
    await oauth.validateApplicationLevelSignature(tenantAs, response);
    const claims = oauth.getValidatedIdTokenClaims(token)!;
    const tid = String(claims.tid);
    if (!UUID.test(tid) || !claims.sub || claims.iss !== `${MICROSOFT}/${tid}/v2.0`)
      throw new AppError('auth_invalid');
    const account: Account = {
      id: `${tid}:${claims.sub}`,
      tenantId: tid,
      name: typeof claims.name === 'string' ? claims.name : 'Microsoft account',
      username: typeof claims.preferred_username === 'string' ? claims.preferred_username : '',
    };
    if (generation !== currentGeneration) throw new AppError('auth_cancelled');
    await chrome.storage.session.set({
      [SESSION_KEY]: {
        account,
        accessToken: token.access_token,
        refreshToken: token.refresh_token,
        expiresAt: Date.now() + Number(token.expires_in ?? 3600) * 1000,
      } satisfies Session,
    });
    return account;
  } catch (error) {
    throw authError(error);
  } finally {
    await chrome.storage.session.remove(TRANSACTION_KEY);
  }
}

/** 合并同时发起的登录，完成后仅向界面返回账号摘要，喵~ */
export function login(): Promise<Account> {
  if (!loginFlight)
    loginFlight = performLogin().finally(() => {
      loginFlight = undefined;
    });
  return loginFlight;
}

/** 返回账号摘要，未登录时不返回此前账号的凭据或业务数据，喵~ */
export async function getAccount(): Promise<Account | undefined> {
  return (await readSession())?.account;
}

/** 在微软令牌端点刷新已有授权，失败时由用户主动重新登录，喵~ */
async function refresh(session: Session): Promise<Session> {
  const currentGeneration = generation;
  if (!session.refreshToken) throw new AppError('auth_required');
  try {
    const as = await metadata(session.account.tenantId);
    const response = await oauth.refreshTokenGrantRequest(as, client, oauth.None(), session.refreshToken, {
      signal: AbortSignal.timeout(20_000),
    });
    const token = await oauth.processRefreshTokenResponse(as, client, response);
    if (token.id_token) {
      await oauth.validateApplicationLevelSignature(as, response);
      const claims = oauth.getValidatedIdTokenClaims(token);
      if (`${claims?.tid}:${claims?.sub}` !== session.account.id) throw new AppError('auth_invalid');
    }
    if (currentGeneration !== generation || (await readSession())?.account.id !== session.account.id)
      throw new AppError('auth_required');
    const next: Session = {
      ...session,
      accessToken: token.access_token,
      refreshToken: token.refresh_token ?? session.refreshToken,
      expiresAt: Date.now() + Number(token.expires_in ?? 3600) * 1000,
    };
    await chrome.storage.session.set({ [SESSION_KEY]: next });
    return next;
  } catch (error) {
    throw authError(error);
  }
}

/** 为指定账号取得可用令牌，阻止切号后沿用其他账号的请求，喵~ */
export async function accessToken(accountId: string, forceRefresh = false): Promise<string> {
  let session = await readSession();
  if (!session || session.account.id !== accountId) throw new AppError('auth_required');
  if (forceRefresh || session.expiresAt < Date.now() + 60_000) {
    if (!refreshFlight)
      refreshFlight = refresh(session).finally(() => {
        refreshFlight = undefined;
      });
    session = await refreshFlight;
  }
  if (session.account.id !== accountId) throw new AppError('auth_required');
  return session.accessToken;
}

/** 退出本扩展并阻止在途授权重新写入会话，微软网站会话由用户自行管理，喵~ */
export async function logout(): Promise<void> {
  generation++;
  await chrome.storage.session.remove([SESSION_KEY, TRANSACTION_KEY]);
}
