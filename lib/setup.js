import { spawn, execSync } from 'child_process';
import https from 'https';
import http from 'http';
import net from 'net';
import fs from 'fs';
import path from 'path';
import { log, spin, stopSpin } from './log.js';

const PB_URL = 'http://127.0.0.1:8090';

function httpPost(url, body, token) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const opts = new URL(url);
    const req = http.request({
      hostname: opts.hostname,
      port: opts.port,
      path: opts.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(d) }); }
        catch { resolve({ status: res.statusCode, body: d }); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function httpGet(url, token) {
  return new Promise((resolve, reject) => {
    const opts = new URL(url);
    http.get({
      hostname: opts.hostname,
      port: opts.port,
      path: opts.pathname + opts.search,
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(d) }); }
        catch { resolve({ status: res.statusCode, body: d }); }
      });
    }).on('error', reject);
  });
}

function checkPortFree(port) {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.once('error', () => reject(new Error(
      `Port ${port} is already in use. Stop any running PocketBase instances and try again.`
    )));
    srv.once('listening', () => srv.close(resolve));
    srv.listen(port, '127.0.0.1');
  });
}

function waitForPB(retries = 30, delay = 1000) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const check = () => {
      httpGet(`${PB_URL}/api/health`)
        .then(r => {
          if (r.status === 200) resolve();
          else retry();
        })
        .catch(() => retry());
    };
    const retry = () => {
      attempts++;
      if (attempts >= retries) return reject(new Error('PocketBase did not start in time'));
      setTimeout(check, delay);
    };
    check();
  });
}

export function spawnPocketBase(pbBin, pbDir) {
  const pb = spawn(pbBin, [
    'serve',
    '--http=127.0.0.1:8090',
    `--dir=${path.join(pbDir, 'pb_data')}`,
    `--publicDir=${path.join(pbDir, 'pb_public')}`
  ], {
    cwd: pbDir,
    stdio: ['ignore', 'ignore', 'pipe'],
    detached: false
  });
  pb.on('error', err => { throw err; });
  let stderrBuf = '';
  pb.stderr.on('data', d => { stderrBuf += d.toString(); });
  pb._stderrBuf = () => stderrBuf;
  return pb;
}

export async function startAndSetup(pbDir, email, password) {
  const pbBin = path.join(pbDir, process.platform === 'win32' ? 'pocketbase.exe' : 'pocketbase');
  const pbDataDir = path.join(pbDir, 'pb_data');

  fs.mkdirSync(pbDataDir, { recursive: true });

  spin('Creating superuser admin account');
  execSync(`"${pbBin}" superuser upsert "${email}" "${password}" --dir="${pbDataDir}"`, { stdio: 'ignore' });
  stopSpin();
  log('ok', 'Admin account created');

  spin('Checking port 8090');
  await checkPortFree(8090);
  stopSpin();

  spin('Starting PocketBase');
  const pb = spawnPocketBase(pbBin, pbDir);
  await waitForPB();
  stopSpin();
  log('ok', 'PocketBase is running at http://127.0.0.1:8090');

  spin('Authenticating');
  const authRes = await httpPost(`${PB_URL}/api/collections/_superusers/auth-with-password`, {
    identity: email,
    password
  });

  if (authRes.status !== 200) {
    throw new Error(`Authentication failed: ${JSON.stringify(authRes.body)}`);
  }
  stopSpin();
  log('ok', 'Authenticated');

  return { token: authRes.body.token, pb };
}

export { httpPost, httpGet, PB_URL };
