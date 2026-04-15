import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { promptInit } from './prompt.js';
import { downloadPocketBase } from './download.js';
import { startAndSetup } from './setup.js';
import { createSiteSettingsCollection, createPostsCollection } from './schema.js';
import { seedPosts, seedSiteSettings } from './seed.js';
import { scaffoldStatic } from './scaffold.js';
import { scaffoldAstro } from './scaffold-astro.js';
import { scaffoldNextJs } from './scaffold-next.js';
import { writeConfig } from './discover.js';
import { step, log, success } from './log.js';
import { findAvailablePort } from './port.js';

const FRAMEWORK_LABELS = { static: 'Static HTML', astro: 'Astro', nextjs: 'Next.js' };
const FRAMEWORK_PORTS  = { static: 8090, astro: 4321, nextjs: 3000 };

export async function init() {
  const { name, framework, lang, email, password } = await promptInit();

  step('Finding available port');
  const pbPort = await findAvailablePort(8090);
  log('info', `Using port ${pbPort} for PocketBase`);

  const projectDir = path.resolve(process.cwd(), name);
  if (fs.existsSync(projectDir)) {
    throw new Error(`Directory "${name}" already exists.`);
  }

  fs.mkdirSync(projectDir, { recursive: true });

  const pbDir    = path.join(projectDir, 'pb');
  const pbPublicDir = path.join(pbDir, 'pb_public');
  const webDir   = path.join(projectDir, 'web');

  step('① Downloading PocketBase');
  await downloadPocketBase(pbDir);

  step(`② Scaffolding ${FRAMEWORK_LABELS[framework]} site`);
  if (framework === 'astro') {
    scaffoldAstro(webDir, lang, pbPort);
  } else if (framework === 'nextjs') {
    scaffoldNextJs(webDir, lang, pbPort);
  } else {
    scaffoldStatic(pbPublicDir, lang, pbPort);
  }

  step('③ Starting PocketBase & setting up admin');
  const { token, pb, pbUrl } = await startAndSetup(pbDir, email, password, pbPort);

  step('④ Creating schema');
  await createSiteSettingsCollection(token, pbUrl);
  await createPostsCollection(token, pbUrl);

  step('⑤ Seeding content');
  await seedSiteSettings(token, name, lang, pbUrl);
  await seedPosts(token, pbUrl);

  step('⑥ Discovering schema & writing config');
  await writeConfig(projectDir, token, framework, pbPort);

  const sitePort = FRAMEWORK_PORTS[framework];
  const blogPath  = framework === 'static' ? '/blog/' : '/blog';
  success(name, [
    ['Site',       `http://localhost:${sitePort}`],
    ['Blog',       `http://localhost:${sitePort}${blogPath}`],
    ['Admin CMS',  `${pbUrl}/admin/`],
    ['PB Admin',   `${pbUrl}/_/`],
  ]);

  const procs = [pb];

  if (framework === 'astro' || framework === 'nextjs') {
    const label = framework === 'astro' ? 'Astro' : 'Next.js';
    log('info', `Starting ${label} dev server…`);
    const web = spawn('npm', ['run', 'dev'], {
      cwd: webDir,
      stdio: 'inherit',
      shell: process.platform === 'win32'
    });
    web.on('error', err => console.error('\x1b[31m✖ ' + err.message + '\x1b[0m'));
    procs.push(web);
  }

  const cleanup = () => { procs.forEach(p => p.kill()); process.exit(0); };
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}
