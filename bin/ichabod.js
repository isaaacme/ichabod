#!/usr/bin/env node
import { init } from '../lib/init.js';
import { start } from '../lib/start.js';

const cmd = process.argv[2];
const W   = Math.min(process.stdout.columns || 72, 80);
const DIV = '\x1b[2m' + '─'.repeat(W - 2) + '\x1b[0m';

process.stdout.write(`
\x1b[33m  ___      _           _             _
 |_ _|___| |__   __ _| |__   ___  __| |
  | |/ __| '_ \\ / _\` | '_ \\ / _ \\/ _\` |
  | | (__| | | | (_| | |_) | (_) | (_| |
 |___\\___|_| |_|\\__,_|_.__/ \\___/ \\__,_|\x1b[0m

 ${DIV}
 \x1b[2mPocketBase Site Generator\x1b[0m  \x1b[36m●\x1b[0m \x1b[2mzero-config\x1b[0m  \x1b[36m●\x1b[0m \x1b[2mzero-deps\x1b[0m
 ${DIV}

`);

switch (cmd) {
  case 'init':
    init().catch(e => { console.error(`\n  \x1b[31m✖\x1b[0m  \x1b[31m${e.message}\x1b[0m\n`); process.exit(1); });
    break;
  case 'start':
    start().catch(e => { console.error(`\n  \x1b[31m✖\x1b[0m  \x1b[31m${e.message}\x1b[0m\n`); process.exit(1); });
    break;
  default:
    console.log(`  \x1b[1mUsage\x1b[0m\n`);
    console.log(`  \x1b[36mnpx ichabod init\x1b[0m   \x1b[2m— scaffold a new project\x1b[0m`);
    console.log(`  \x1b[36mnpx ichabod start\x1b[0m  \x1b[2m— start servers in an existing project\x1b[0m\n`);
    break;
}
