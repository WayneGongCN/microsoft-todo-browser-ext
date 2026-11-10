import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const pkg = JSON.parse(await readFile('package.json', 'utf8'));
const edge = process.argv[2] === 'edge';
const releaseDirectory = edge ? '.output/release/edge' : '.output/release';
const targets = edge
  ? [['.output/edge-mv3', 'edge']]
  : [
      ['.output/chrome-mv3', 'chrome'],
      ['.output/chrome-mv3-acceptance', 'acceptance'],
    ];
await mkdir(releaseDirectory, { recursive: true });
const artifacts = [];

/** 打包前核对扩展入口、本地化及最小权限，防止测试页或旧构建进入发布包，喵~ */
async function validate(directory, suffix) {
  const manifest = JSON.parse(await readFile(`${directory}/manifest.json`, 'utf8'));
  if (manifest.manifest_version !== 3 || manifest.version !== pkg.version || manifest.default_locale !== 'en')
    throw new Error('Invalid release manifest.');
  const permissions = [...manifest.permissions].sort().join(',');
  if (permissions !== 'activeTab,contextMenus,identity,scripting,storage' || manifest.content_scripts?.length)
    throw new Error('Unexpected extension permissions.');
  if (suffix !== 'acceptance' && ('key' in manifest || 'update_url' in manifest))
    throw new Error('Store packages must not set key or update_url.');
  if ((await readdir(directory)).includes('verify.html'))
    throw new Error('Verification entrypoint must not ship.');
  if (!manifest.background?.service_worker) throw new Error('Missing background service worker.');
  for (const entry of ['popup.html', 'options.html', manifest.background.service_worker])
    await readFile(`${directory}/${entry}`);
  const hosts = [...(manifest.host_permissions ?? [])].sort().join(',');
  if (hosts !== 'https://graph.microsoft.com/*,https://login.microsoftonline.com/*')
    throw new Error('Unexpected network hosts.');
  return manifest;
}

for (const [directory, suffix] of targets) {
  const manifest = await validate(directory, suffix);
  const file = `microsoft-todo-capture-${pkg.version}-${suffix}.zip`;
  const destination = resolve(releaseDirectory, file);
  execFileSync('zip', ['-q', '-r', '-FS', destination, '.'], { cwd: directory });
  const bytes = await readFile(destination);
  artifacts.push({
    file,
    sha256: createHash('sha256').update(bytes).digest('hex'),
    bytes: bytes.length,
    version: manifest.version,
  });
}

const sourceCommit = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const dirty = execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' }).trim().length > 0;
await writeFile(
  `${releaseDirectory}/release.json`,
  JSON.stringify({ sourceCommit, dirty, artifacts }, null, 2) + '\n',
);
await writeFile(
  `${releaseDirectory}/SHA256SUMS`,
  artifacts.map((item) => `${item.sha256}  ${item.file}`).join('\n') + '\n',
);
console.log(JSON.stringify({ sourceCommit, dirty, artifacts }, null, 2));
