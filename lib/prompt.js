import readline from 'readline';
import { section } from './log.js';

function ask(rl, question) {
  return new Promise(resolve => rl.question(question, resolve));
}

function askHidden(rl, question) {
  return new Promise(resolve => {
    let muted = false;
    const orig = rl._writeToOutput.bind(rl);
    rl._writeToOutput = (str) => {
      if (!muted) orig(str);
    };
    rl.question(question, ans => {
      muted = false;
      rl._writeToOutput = orig;
      process.stdout.write('\n');
      resolve(ans.trim());
    });
    muted = true;
  });
}

const FRAMEWORKS = [
  { id: 'static', label: 'Static HTML', desc: 'served by PocketBase, zero build step' },
  { id: 'astro',  label: 'Astro',       desc: 'component-based, fast static site' },
  { id: 'nextjs', label: 'Next.js',     desc: 'React-based, full-stack ready' },
];

async function askFramework(rl) {
  console.log('  Framework:');
  FRAMEWORKS.forEach((f, i) => {
    console.log(`    \x1b[2m${i + 1})\x1b[0m \x1b[1m${f.label}\x1b[0m \x1b[2m— ${f.desc}\x1b[0m`);
  });
  const raw = (await ask(rl, '  Choice \x1b[2m(1)\x1b[0m: ')).trim();
  const idx = parseInt(raw, 10) - 1;
  const chosen = FRAMEWORKS[idx] ?? FRAMEWORKS[0];
  return chosen.id;
}

export async function promptInit() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  section('Project Setup');

  const name = (await ask(rl, '  Project name \x1b[2m(my-site)\x1b[0m: ')).trim() || 'my-site';
  console.log();
  const framework = await askFramework(rl);
  const lang = (await ask(rl, '  Site language \x1b[2m(en)\x1b[0m: ')).trim().toLowerCase() || 'en';

  section('Admin Credentials');

  let email = '';
  while (!email.includes('@')) {
    email = (await ask(rl, '  Admin email: ')).trim();
    if (!email.includes('@')) console.log('  \x1b[31m✖  Please enter a valid email.\x1b[0m');
  }

  let password = '';
  while (password.length < 8) {
    password = await askHidden(rl, '  Admin password \x1b[2m(min 8 chars)\x1b[0m: ');
    if (password.length < 8) console.log('  \x1b[31m✖  Password must be at least 8 characters.\x1b[0m');
  }

  rl.close();
  console.log();
  return { name, framework, lang, email, password };
}
