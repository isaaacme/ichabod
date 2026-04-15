const FRAMES = ['⠋','⠙','⠹','⠸','⠼','⠴','⠦','⠧','⠇','⠏'];
const _col   = () => Math.min(process.stdout.columns || 72, 80);

let _timer = null, _frame = 0, _t0 = 0;

function _clear() {
  if (_timer) { clearInterval(_timer); _timer = null; process.stdout.write('\r\x1b[2K'); }
}

export function spin(msg) {
  _clear();
  _frame = 0; _t0 = Date.now();
  _timer = setInterval(() => {
    const s = ((Date.now() - _t0) / 1000).toFixed(1);
    process.stdout.write(`\r  \x1b[36m${FRAMES[_frame++ % FRAMES.length]}\x1b[0m  ${msg}  \x1b[2m${s}s\x1b[0m    `);
  }, 80);
}

export function stopSpin(doneMsg) {
  _clear();
  if (doneMsg) console.log(`  \x1b[32m✔\x1b[0m  ${doneMsg}`);
}

export function ok(msg)   { _clear(); console.log(`  \x1b[32m✔\x1b[0m  ${msg}`); }
export function info(msg) { _clear(); console.log(`  \x1b[34mℹ\x1b[0m  \x1b[2m${msg}\x1b[0m`); }
export function warn(msg) { _clear(); console.log(`  \x1b[33m⚠\x1b[0m  \x1b[33m${msg}\x1b[0m`); }
export function err(msg)  { _clear(); console.log(`  \x1b[31m✖\x1b[0m  \x1b[31m${msg}\x1b[0m`); }

export function log(level, msg) {
  if (level === 'ok')    return ok(msg);
  if (level === 'warn')  return warn(msg);
  if (level === 'error') return err(msg);
  return info(msg);
}

export function step(msg) {
  const w   = _col();
  const txt = `  ${msg}  `;
  const bar = '\x1b[2m' + '─'.repeat(Math.max(0, w - txt.length)) + '\x1b[0m';
  console.log(`\n\x1b[1m${txt}\x1b[0m${bar}`);
}

export function section(title) {
  const w = _col();
  console.log(`\n  \x1b[36m◆\x1b[0m \x1b[1m${title}\x1b[0m`);
  console.log(`  \x1b[2m${'─'.repeat(Math.min(w - 4, 48))}\x1b[0m`);
}

export function success(name, urlPairs) {
  const inner = `  ✔  "${name}" is ready!  `;
  const bw    = Math.max(inner.length + 2, 42);
  console.log('\n  \x1b[32m╭' + '─'.repeat(bw) + '╮\x1b[0m');
  console.log('  \x1b[32m│\x1b[0m\x1b[1m' + inner.padEnd(bw) + '\x1b[32m│\x1b[0m');
  console.log('  \x1b[32m╰' + '─'.repeat(bw) + '╯\x1b[0m\n');
  for (const [label, url] of urlPairs) {
    console.log(`  \x1b[2m${(label + ' ').padEnd(13, '·')}\x1b[0m  \x1b[36m${url}\x1b[0m`);
  }
  console.log(`\n  \x1b[2mPress\x1b[0m \x1b[1mCtrl+C\x1b[0m \x1b[2mto stop.\x1b[0m\n`);
}
