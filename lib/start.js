import fs from 'fs';
import net from 'net';
import path from 'path';
import { spawn } from 'child_process';
import { log, ok, info } from './log.js';

const FRAMEWORK_PORTS = { static: null, astro: 4321, nextjs: 3000 };

function checkPortFree(port) {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.once('error', () => reject(new Error(
      `Port ${port} is already in use. Stop any running instances first.`
    )));
    srv.once('listening', () => srv.close(resolve));
    srv.listen(port, '127.0.0.1');
  });
}

function spawnInherited(cmd, args, cwd) {
  const proc = spawn(cmd, args, { cwd, stdio: 'inherit', shell: process.platform === 'win32' });
  proc.on('error', err => { console.error('\x1b[31m✖ ' + err.message + '\x1b[0m'); });
  return proc;
}

export async function start() {
  const cwd = process.cwd();
  const pbDir = path.resolve(cwd, 'pb');
  const pbBin = path.join(pbDir, process.platform === 'win32' ? 'pocketbase.exe' : 'pocketbase');
  const webDir = path.resolve(cwd, 'web');

  if (!fs.existsSync(pbBin)) {
    throw new Error('No PocketBase binary found at pb/pocketbase. Run "npx ichabod init" first.');
  }

  let framework = 'static';
  const cfgPath = path.resolve(cwd, 'pb.config.json');
  if (fs.existsSync(cfgPath)) {
    try { framework = JSON.parse(fs.readFileSync(cfgPath, 'utf8')).framework ?? 'static'; } catch {}
  }

  await checkPortFree(8090);
  if (framework !== 'static') await checkPortFree(FRAMEWORK_PORTS[framework]);

  info('Starting PocketBase…');
  const pb = spawn(pbBin, [
    'serve',
    '--http=127.0.0.1:8090',
    `--dir=${path.join(pbDir, 'pb_data')}`,
    `--publicDir=${path.join(pbDir, 'pb_public')}`
  ], { cwd: pbDir, stdio: 'inherit', detached: false });

  pb.on('error', e => { console.error(`\n  \x1b[31m✖\x1b[0m  \x1b[31m${e.message}\x1b[0m\n`); process.exit(1); });
  pb.on('exit', code => { if (code !== 0 && code !== null) console.error(`\n  \x1b[31m✖\x1b[0m  PocketBase exited (${code})\n`); });

  const procs = [pb];

  if (framework === 'astro' && fs.existsSync(webDir)) {
    info('Starting Astro dev server…');
    procs.push(spawnInherited('npm', ['run', 'dev'], webDir));
  } else if (framework === 'nextjs' && fs.existsSync(webDir)) {
    info('Starting Next.js dev server…');
    procs.push(spawnInherited('npm', ['run', 'dev'], webDir));
  }

  const sitePort  = FRAMEWORK_PORTS[framework] ?? 8090;
  const blogPath  = framework === 'static' ? '/blog/' : '/blog';
  const col = (s) => `  \x1b[2m${(s + ' ').padEnd(13, '·')}\x1b[0m  \x1b[36m`;
  console.log();
  console.log(col('Site')       + `http://localhost:${sitePort}\x1b[0m`);
  console.log(col('Blog')       + `http://localhost:${sitePort}${blogPath}\x1b[0m`);
  console.log(col('Admin CMS')  + 'http://localhost:8090/admin/\x1b[0m');
  console.log(col('PB Admin')   + 'http://localhost:8090/_/\x1b[0m');
  console.log(`\n  \x1b[2mPress\x1b[0m \x1b[1mCtrl+C\x1b[0m \x1b[2mto stop.\x1b[0m\n`);

  const cleanup = () => { procs.forEach(p => p.kill()); process.exit(0); };
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}
