import { httpPost, httpGet } from './setup.js';
import { log, spin, stopSpin } from './log.js';

const SEO_FIELDS = [
  { name: 'seo_title',       type: 'text' },
  { name: 'seo_description', type: 'text' },
  { name: 'canonical_url',   type: 'url'  },
  { name: 'no_index',        type: 'bool' },
];

export async function createSiteSettingsCollection(token, pbUrl) {
  spin('Creating site_settings collection');

  const existing = await httpGet(`${pbUrl}/api/collections/site_settings`, token);
  if (existing.status === 200) {
    stopSpin();
    log('warn', 'site_settings collection already exists — skipping');
    return;
  }

  const createRes = await httpPost(`${pbUrl}/api/collections`, {
    name: 'site_settings',
    type: 'base',
    fields: [
      { name: 'site_title',       type: 'text' },
      { name: 'site_description', type: 'text' },
      { name: 'lang',             type: 'text' },
      { name: 'og_image',         type: 'file' },
      { name: 'robots',           type: 'text' },
    ],
    listRule: '',
    viewRule: '',
    createRule: null,
    updateRule: null,
    deleteRule: null
  }, token);

  stopSpin();
  if (createRes.status !== 200 && createRes.status !== 201) {
    throw new Error(`Failed to create site_settings: ${JSON.stringify(createRes.body)}`);
  }
  log('ok', 'site_settings collection created');
}

export async function createPostsCollection(token, pbUrl) {
  spin('Creating posts collection');

  const existing = await httpGet(`${pbUrl}/api/collections/posts`, token);
  if (existing.status === 200) {
    stopSpin();
    log('warn', 'posts collection already exists — skipping');
    return;
  }

  const schemaRes = await httpPost(`${pbUrl}/api/collections`, {
    name: 'posts',
    type: 'base',
    fields: [
      { name: 'title', type: 'text', required: true },
      { name: 'slug', type: 'text', required: true, options: { pattern: '^[a-z0-9-]+$' } },
      { name: 'excerpt', type: 'text' },
      { name: 'body', type: 'editor' },
      { name: 'published_date', type: 'date' },
      ...SEO_FIELDS
    ],
    listRule: '',
    viewRule: '',
    createRule: null,
    updateRule: null,
    deleteRule: null
  }, token);

  stopSpin();

  if (schemaRes.status !== 200 && schemaRes.status !== 201) {
    throw new Error(`Failed to create posts collection: ${JSON.stringify(schemaRes.body)}`);
  }

  log('ok', 'posts collection created');
}

export async function discoverCollections(token, pbUrl) {
  const res = await httpGet(`${pbUrl}/api/collections?perPage=100`, token);
  if (res.status !== 200) throw new Error('Failed to fetch collections');
  return res.body.items
    .filter(c => !c.name.startsWith('_'))
    .map(c => ({ name: c.name, fields: c.fields?.map(f => f.name) ?? [] }));
}
