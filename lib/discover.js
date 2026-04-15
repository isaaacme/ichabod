import fs from 'fs';
import path from 'path';
import { discoverCollections } from './schema.js';
import { log } from './log.js';

export async function writeConfig(projectDir, token, framework = 'static') {
  const collections = await discoverCollections(token);

  const routes = {};
  for (const c of collections) {
    routes[c.name] = c.name === 'posts' ? '/blog' : `/${c.name}`;
  }

  const config = {
    framework,
    collections: collections.map(c => c.name),
    routes,
    schema: collections
  };

  fs.mkdirSync(projectDir, { recursive: true });
  fs.writeFileSync(
    path.join(projectDir, 'pb.config.json'),
    JSON.stringify(config, null, 2)
  );

  log('ok', 'pb.config.json written');
}
