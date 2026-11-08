import { beforeEach, describe, expect, it, vi } from 'vitest';

const tenant = '9188040d-6c67-4c5b-b112-36a304b66dad';
const origin = 'https://login.microsoftonline.com';
const issuer = `${origin}/${tenant}/v2.0`;
let storage: Record<string, unknown>;
let nonce: string;
let redirectState: string;
let wrongNonce = false;
let corruptSignature = false;
let redirectedState = false;
let keyPair: CryptoKeyPair;

/** 用浏览器兼容的编码构造测试令牌，密钥仅用于本地协议测试，喵~ */
function encode(value: string | Uint8Array): string {
  const bytes = typeof value === 'string' ? new TextEncoder().encode(value) : value;
  return btoa(String.fromCharCode(...bytes))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

/** 为真实 OAuth 校验库签发本地测试身份令牌，喵~ */
async function token(): Promise<string> {
  const header = encode(JSON.stringify({ alg: 'RS256', kid: 'test-key' }));
  const claims = encode(
    JSON.stringify({
      iss: issuer,
      aud: '07171723-a302-4e3c-875d-197490f956eb',
      sub: 'test-subject',
      tid: tenant,
      name: 'Test account',
      preferred_username: 'person@example.com',
      nonce: wrongNonce ? 'wrong' : nonce,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
    }),
  );
  const signature = new Uint8Array(
    await crypto.subtle.sign(
      'RSASSA-PKCS1-v1_5',
      keyPair.privateKey,
      new TextEncoder().encode(`${header}.${claims}`),
    ),
  );
  if (corruptSignature) signature[0] = signature[0]! ^ 1;
  return `${header}.${claims}.${encode(signature)}`;
}

beforeEach(async () => {
  vi.resetModules();
  storage = {};
  wrongNonce = false;
  corruptSignature = false;
  redirectedState = false;
  keyPair = await crypto.subtle.generateKey(
    {
      name: 'RSASSA-PKCS1-v1_5',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true,
    ['sign', 'verify'],
  );
  vi.stubGlobal('chrome', {
    storage: {
      session: {
        get: vi.fn(async (key: string) => ({ [key]: storage[key] })),
        set: vi.fn(async (values: Record<string, unknown>) => {
          Object.assign(storage, values);
        }),
        remove: vi.fn(async (keys: string | string[]) => {
          for (const key of [keys].flat()) delete storage[key];
        }),
      },
    },
    identity: {
      getRedirectURL: () => 'https://gopiiihaachagcmaijfaphjijefgbgnk.chromiumapp.org/',
      launchWebAuthFlow: vi.fn(async ({ url }: { url: string }) => {
        const params = new URL(url).searchParams;
        nonce = params.get('nonce')!;
        redirectState = params.get('state')!;
        expect(params.get('code_challenge_method')).toBe('S256');
        expect(params.get('code_challenge')).toHaveLength(43);
        return `https://gopiiihaachagcmaijfaphjijefgbgnk.chromiumapp.org/?code=test-code&state=${redirectedState ? 'tampered' : redirectState}`;
      }),
    },
  });
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: string | URL) => {
      const url = String(input);
      if (url.includes('.well-known'))
        return Response.json({
          issuer: url.includes('/common/') ? `${origin}/{tenantid}/v2.0` : issuer,
          authorization_endpoint: `${origin}/common/oauth2/v2.0/authorize`,
          token_endpoint: `${origin}/common/oauth2/v2.0/token`,
          jwks_uri: `${origin}/common/discovery/v2.0/keys`,
        });
      if (url.endsWith('/keys'))
        return Response.json({
          keys: [
            {
              ...(await crypto.subtle.exportKey('jwk', keyPair.publicKey)),
              kid: 'test-key',
              use: 'sig',
              alg: 'RS256',
            },
          ],
        });
      if (url.endsWith('/token'))
        return Response.json({
          token_type: 'Bearer',
          access_token: 'test-access-token',
          refresh_token: 'test-refresh-token',
          expires_in: 3600,
          id_token: await token(),
        });
      throw new Error('Unexpected test request');
    }),
  );
});

describe('Microsoft PKCE session', () => {
  it('validates the signed identity and exposes only an account summary', async () => {
    const auth = await import('../src/core/auth');
    const account = await auth.login();
    expect(account.id).toBe(`${tenant}:test-subject`);
    expect(JSON.stringify(account)).not.toContain('test-access-token');
    expect(await auth.accessToken(account.id)).toBe('test-access-token');
    expect(storage['v2:authorization']).toBeUndefined();
  });

  it('rejects a mismatched state before sending an authorization code', async () => {
    redirectedState = true;
    const auth = await import('../src/core/auth');
    await expect(auth.login()).rejects.toMatchObject({ code: 'auth_invalid' });
    expect(storage['v2:auth']).toBeUndefined();
    expect(vi.mocked(fetch).mock.calls.some(([url]) => String(url).endsWith('/token'))).toBe(false);
  });

  it('rejects an incorrect nonce', async () => {
    wrongNonce = true;
    const auth = await import('../src/core/auth');
    await expect(auth.login()).rejects.toMatchObject({ code: 'auth_invalid' });
    expect(storage['v2:auth']).toBeUndefined();
  });

  it('rejects a tampered ID-token signature', async () => {
    corruptSignature = true;
    const auth = await import('../src/core/auth');
    await expect(auth.login()).rejects.toMatchObject({ code: 'auth_invalid' });
    expect(storage['v2:auth']).toBeUndefined();
  });

  it('clears the session on logout and refuses requests for another account', async () => {
    const auth = await import('../src/core/auth');
    const account = await auth.login();
    await expect(auth.accessToken('other-account')).rejects.toMatchObject({ code: 'auth_required' });
    await auth.logout();
    expect(await auth.getAccount()).toBeUndefined();
    await expect(auth.accessToken(account.id)).rejects.toMatchObject({ code: 'auth_required' });
  });
});

it('refreshes an expired access token using the existing session', async () => {
  const auth = await import('../src/core/auth');
  const account = await auth.login();
  expect(await auth.accessToken(account.id, true)).toBe('test-access-token');
  expect(await auth.getAccount()).toEqual(account);
});
