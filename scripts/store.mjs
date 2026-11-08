import { mkdir, readFile, writeFile } from 'node:fs/promises';

const action = process.argv[2] ?? 'status';
const item = 'ffpljgmbiankjaokoefefmkoghcgoodn';
const publisher = 'd4802d4b-617d-4dcc-b48b-eb33b6480458';
const name = `publishers/${publisher}/items/${item}`;
const endpoint = `https://chromewebstore.googleapis.com/v2/${name}`;

/** 只向原 Google OAuth 客户端刷新已有凭据，凭据与原始响应不输出到日志，喵~ */
async function accessToken() {
  const refreshToken = process.env.CWS_REFRESH_TOKEN;
  if (!refreshToken) throw new Error('CWS_REFRESH_TOKEN is required.');
  const body = new URLSearchParams({
    client_id:
      process.env.CWS_CLIENT_ID || '846943702071-dg8uf689j8bsn816avetglmtpis4hr3m.apps.googleusercontent.com',
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  });
  if (process.env.CWS_CLIENT_SECRET) body.set('client_secret', process.env.CWS_CLIENT_SECRET);
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    body,
    signal: AbortSignal.timeout(20_000),
  });
  const result = await response.json();
  if (!response.ok || typeof result.access_token !== 'string')
    throw new Error(
      `OAuth refresh failed: HTTP ${response.status}, ${/^[a-z_]+$/.test(result.error ?? '') ? result.error : 'unknown_error'}`,
    );
  return result.access_token;
}

/** 使用官方 v2 API 并只保留与发布阶段有关的返回字段，喵~ */
async function request(token, url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: { Authorization: `Bearer ${token}`, ...options.headers },
    signal: AbortSignal.timeout(60_000),
  });
  const result = await response.json();
  if (!response.ok)
    throw new Error(
      `Chrome Web Store API failed: HTTP ${response.status}, ${result.error?.status ?? 'unknown_error'}`,
    );
  return result;
}

/** 状态查询不触发上传或提审，发布动作必须由明确的命令选择，喵~ */
async function main() {
  if (!['status', 'upload', 'submit', 'release'].includes(action))
    throw new Error('Expected status, upload, submit or release.');
  const token = await accessToken();
  const before = await request(token, `${endpoint}:fetchStatus`);
  if (action === 'status') {
    await mkdir('.output', { recursive: true });
    await writeFile('.output/store-status.json', JSON.stringify(before, null, 2) + '\n');
    console.log(
      JSON.stringify({
        itemId: before.itemId,
        takenDown: before.takenDown,
        published: before.publishedItemRevisionStatus,
        submitted: before.submittedItemRevisionStatus,
        publicKeyAvailable: Boolean(before.publicKey),
      }),
    );
    return;
  }
  if (action === 'release') {
    if (before.submittedItemRevisionStatus?.state !== 'STAGED')
      throw new Error('The current submission is not approved and staged.');
    const pkg = JSON.parse(await readFile('package.json', 'utf8'));
    const channels = before.submittedItemRevisionStatus.distributionChannels;
    if (!channels?.length || channels.some((channel) => channel.crxVersion !== pkg.version))
      throw new Error('The approved version does not match this release.');
  } else {
    const path = process.argv[3];
    if (!path?.endsWith('.zip')) throw new Error('A validated release ZIP is required.');
    const file = await readFile(path);
    const uploaded = await request(token, `https://chromewebstore.googleapis.com/upload/v2/${name}:upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/zip' },
      body: file,
    });
    console.log(JSON.stringify({ phase: 'upload', uploadState: uploaded.uploadState }));
    if (uploaded.uploadState !== 'SUCCEEDED')
      throw new Error('Upload has not completed; query status before any publish attempt.');
    if (action === 'upload') return;
  }
  const submitted = await request(token, `${endpoint}:publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      publishType: action === 'release' ? 'DEFAULT_PUBLISH' : 'STAGED_PUBLISH',
      blockOnWarnings: true,
      skipReview: false,
    }),
  });
  console.log(
    JSON.stringify({
      phase: action === 'release' ? 'publish' : 'submit-for-review',
      itemId: submitted.itemId,
      state: submitted.state,
    }),
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
