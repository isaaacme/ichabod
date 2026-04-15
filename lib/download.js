import https from 'https';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { log, spin, stopSpin } from './log.js';

const LATEST_URL = 'https://api.github.com/repos/pocketbase/pocketbase/releases/latest';

function getPlatformAsset() {
  const { platform, arch } = process;
  const os = platform === 'win32' ? 'windows' : platform === 'darwin' ? 'darwin' : 'linux';
  const cpu = arch === 'arm64' ? 'arm64' : arch === 'ia32' ? '386' : 'amd64';
  return { os, cpu };
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const opts = new URL(url);
    https.get({ hostname: opts.hostname, path: opts.pathname + opts.search, headers: { 'User-Agent': 'ichabod-cli' } }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchJson(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error('Failed to parse GitHub API response')); }
      });
    }).on('error', reject);
  });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const follow = (location) => {
      const opts = new URL(location);
      https.get({ hostname: opts.hostname, path: opts.pathname + opts.search, headers: { 'User-Agent': 'ichabod-cli' } }, res => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return follow(res.headers.location);
        }
        const file = fs.createWriteStream(dest);
        res.pipe(file);
        file.on('finish', () => file.close(resolve));
        file.on('error', reject);
      }).on('error', reject);
    };
    follow(url);
  });
}

export async function downloadPocketBase(pbDir) {
  spin('Fetching latest PocketBase release');
  const release = await fetchJson(LATEST_URL);
  stopSpin();

  const { os, cpu } = getPlatformAsset();
  const assetName = `pocketbase_${release.tag_name.replace('v', '')}_${os}_${cpu}.zip`;
  const asset = release.assets.find(a => a.name === assetName);

  if (!asset) throw new Error(`No PocketBase binary found for ${os}/${cpu}. Asset: ${assetName}`);

  fs.mkdirSync(pbDir, { recursive: true });
  const zipPath = path.join(pbDir, 'pocketbase.zip');

  spin(`Downloading ${asset.name}`);
  await downloadFile(asset.browser_download_url, zipPath);
  stopSpin();

  log('info', 'Extracting PocketBase binary');
  if (process.platform === 'win32') {
    execSync(`powershell -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${pbDir}' -Force"`);
  } else {
    execSync(`unzip -o "${zipPath}" -d "${pbDir}"`);
    execSync(`chmod +x "${path.join(pbDir, 'pocketbase')}"`);
  }
  fs.unlinkSync(zipPath);

  log('ok', `PocketBase ${release.tag_name} ready`);
  return release.tag_name;
}
