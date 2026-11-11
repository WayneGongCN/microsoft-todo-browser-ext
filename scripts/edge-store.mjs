import { readFile } from 'node:fs/promises';
import { setTimeout } from 'node:timers/promises';

const { EDGE_API_KEY, EDGE_CLIENT_ID, EDGE_PRODUCT_ID } = process.env;
const guid = /^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i;
const submissions = `https://api.addons.microsoftedge.microsoft.com/v1/products/${EDGE_PRODUCT_ID}/submissions`;
const certificationNotes =
  'Use a Microsoft account with access to Microsoft To Do. Open the extension, sign in, choose a list, and save the current webpage as a task. Verify the task in Microsoft To Do.';

function request(url, options = {}) {
  return fetch(url, {
    ...options,
    headers: {
      Authorization: `ApiKey ${EDGE_API_KEY}`,
      'X-ClientID': EDGE_CLIENT_ID,
      ...options.headers,
    },
    redirect: 'error',
    signal: AbortSignal.timeout(30_000),
  });
}

async function runOperation(url, phase, contentType, body) {
  const accepted = await request(url, {
    method: 'POST',
    headers: { 'Content-Type': contentType },
    body,
  });
  if (accepted.status !== 202) {
    throw new Error(`Edge ${phase} was not accepted (HTTP ${accepted.status}).`);
  }
  const operationId = accepted.headers.get('Location')?.split('/').at(-1);
  if (!guid.test(operationId ?? '')) {
    throw new Error(
      `Edge accepted ${phase} without a valid operation ID. Check Partner Center before retrying.`,
    );
  }
  console.log(`Edge ${phase} operation ${operationId} accepted.`);

  for (let attempt = 0; attempt < 30; attempt += 1) {
    await setTimeout(5_000);
    const response = await request(`${url}/operations/${operationId}`);
    if (!response.ok) throw new Error(`Edge ${phase} status check failed (HTTP ${response.status}).`);

    const { status, errorCode } = await response.json();
    if (status === 'Succeeded') return;
    if (status === 'InProgress') continue;
    const code = /^[\w-]+$/.test(errorCode ?? '') ? ` (${errorCode})` : '';
    throw new Error(`Edge ${phase} did not succeed${code}. Check Partner Center for details.`);
  }
  throw new Error(`Edge ${phase} is still pending. Check Partner Center before retrying.`);
}

async function main() {
  if (!EDGE_API_KEY || !EDGE_CLIENT_ID || !guid.test(EDGE_PRODUCT_ID ?? '')) {
    throw new Error('Set EDGE_API_KEY, EDGE_CLIENT_ID and the EDGE_PRODUCT_ID GUID before submitting.');
  }
  const zip = process.argv[2];
  if (!zip?.endsWith('-edge.zip')) throw new Error('Pass the Edge release ZIP.');

  await runOperation(
    `${submissions}/draft/package`,
    'package upload',
    'application/zip',
    await readFile(zip),
  );
  await runOperation(
    submissions,
    'review submission',
    'application/json',
    JSON.stringify({ notes: certificationNotes }),
  );
  console.log('Edge update submitted for review. Microsoft publishes it after certification.');
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
