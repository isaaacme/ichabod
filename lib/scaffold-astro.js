import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { log, spin, stopSpin } from './log.js';
import { scaffoldAdmin } from './scaffold-admin.js';

const PACKAGE_JSON = `{
  "name": "web",
  "type": "module",
  "scripts": {
    "dev": "astro dev --port 4321",
    "build": "astro build",
    "preview": "astro preview"
  },
  "dependencies": {
    "astro": "^5.0.0"
  }
}
`;

const ASTRO_CONFIG = `import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
});
`;

const ENV = (lang) => `PUBLIC_PB_URL=http://localhost:8090
PUBLIC_SITE_LANG=${lang}
`;

const GLOBAL_CSS = `/* Ichabod — minimal marketing theme */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg:      #0f0f11;
  --surface: #18181b;
  --border:  #27272a;
  --text:    #e4e4e7;
  --muted:   #71717a;
  --primary: #a78bfa;
  --accent:  #34d399;
  --radius:  8px;
  --font:    system-ui, -apple-system, 'Segoe UI', sans-serif;
  --mono:    'JetBrains Mono', 'Fira Code', monospace;
  --max:     860px;
}

body { background: var(--bg); color: var(--text); font-family: var(--font); font-size: 1rem; line-height: 1.7; min-height: 100vh; display: flex; flex-direction: column; }
a { color: var(--primary); text-decoration: none; }
a:hover { text-decoration: underline; }

nav { border-bottom: 1px solid var(--border); padding: 1rem 2rem; display: flex; align-items: center; justify-content: space-between; }
.nav-brand { font-size: 1.1rem; font-weight: 700; color: var(--text); letter-spacing: -0.02em; }
.nav-brand span { color: var(--primary); }
.nav-links { display: flex; gap: 1.5rem; }
.nav-links a { color: var(--muted); font-size: 0.9rem; }
.nav-links a:hover { color: var(--text); text-decoration: none; }

main { flex: 1; }
.container { max-width: var(--max); margin: 0 auto; padding: 0 1.5rem; }

.hero { padding: 5rem 1.5rem 4rem; max-width: var(--max); margin: 0 auto; }
.hero-tag { display: inline-block; background: rgba(167,139,250,.12); color: var(--primary); font-size: .75rem; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; padding: .25rem .75rem; border-radius: 999px; border: 1px solid rgba(167,139,250,.25); margin-bottom: 1.5rem; }
.hero h1 { font-size: clamp(2rem,5vw,3.5rem); font-weight: 800; letter-spacing: -0.04em; line-height: 1.1; margin-bottom: 1.25rem; }
.hero h1 em { color: var(--primary); font-style: normal; }
.hero p { font-size: 1.15rem; color: var(--muted); max-width: 560px; margin-bottom: 2rem; }
.hero-actions { display: flex; gap: 1rem; flex-wrap: wrap; }

.btn { display: inline-flex; align-items: center; gap: .5rem; background: var(--primary); color: #0f0f11; font-weight: 700; font-size: .95rem; padding: .65rem 1.4rem; border-radius: var(--radius); border: none; cursor: pointer; transition: opacity .15s; }
.btn:hover { opacity: .88; text-decoration: none; }
.btn-ghost { background: transparent; color: var(--muted); border: 1px solid var(--border); }
.btn-ghost:hover { color: var(--text); }

.features { padding: 3rem 1.5rem 5rem; max-width: var(--max); margin: 0 auto; }
.features-grid { display: grid; grid-template-columns: repeat(auto-fit,minmax(220px,1fr)); gap: 1rem; margin-top: 2rem; }
.feature-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 1.5rem; }
.feature-icon { font-size: 1.5rem; margin-bottom: .75rem; }
.feature-card h3 { font-size: 1rem; font-weight: 600; margin-bottom: .4rem; }
.feature-card p { font-size: .875rem; color: var(--muted); }

.page-header { padding: 3rem 1.5rem 1.5rem; max-width: var(--max); margin: 0 auto; }
.page-header h1 { font-size: 2rem; font-weight: 700; letter-spacing: -0.03em; }
.page-header p { color: var(--muted); margin-top: .5rem; }

.posts-list { max-width: var(--max); margin: 0 auto; padding: .5rem 1.5rem 5rem; display: flex; flex-direction: column; gap: 1rem; }
.post-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 1.5rem 1.75rem; transition: border-color .15s; }
.post-card:hover { border-color: var(--primary); }
.post-date { font-size: .8rem; color: var(--muted); margin-bottom: .5rem; }
.post-card h2 { font-size: 1.15rem; font-weight: 600; margin-bottom: .4rem; }
.post-card h2 a { color: var(--text); }
.post-card p { font-size: .9rem; color: var(--muted); }
.read-more { display: inline-block; margin-top: .75rem; color: var(--primary); font-size: .85rem; font-weight: 500; }

.post-single { max-width: var(--max); margin: 0 auto; padding: 2.5rem 1.5rem 5rem; }
.post-single .post-meta { display: flex; align-items: center; gap: 1rem; font-size: .82rem; color: var(--muted); margin-bottom: 1.5rem; }
.post-single h1 { font-size: clamp(1.6rem,4vw,2.4rem); font-weight: 800; letter-spacing: -0.03em; margin-bottom: 1rem; }
.post-body { font-size: 1.05rem; line-height: 1.8; }
.post-body h2 { font-size: 1.35rem; font-weight: 700; margin: 2rem 0 .75rem; }
.post-body p { margin-bottom: 1rem; }
.post-body ul,.post-body ol { margin: 0 0 1rem 1.5rem; }
.post-body li { margin-bottom: .3rem; }
.post-body a { color: var(--primary); }
.post-body code { font-family: var(--mono); background: var(--surface); border: 1px solid var(--border); padding: .1em .35em; border-radius: 4px; font-size: .88em; }
.post-body pre { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 1.25rem; overflow-x: auto; margin: 1.25rem 0; }
.post-body pre code { background: none; border: none; padding: 0; font-size: .9em; }
.post-body hr { border: none; border-top: 1px solid var(--border); margin: 2rem 0; }
.back-link { display: inline-flex; align-items: center; gap: .4rem; color: var(--muted); font-size: .875rem; margin-bottom: 1.5rem; }
.back-link:hover { color: var(--text); text-decoration: none; }

.empty { text-align: center; padding: 4rem 1rem; color: var(--muted); }

footer { border-top: 1px solid var(--border); padding: 1.5rem 2rem; font-size: .82rem; color: var(--muted); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: .5rem; }
footer a { color: var(--muted); }
footer a:hover { color: var(--text); }

@media (max-width: 600px) { nav { padding: 1rem; } .hero { padding: 3rem 1rem 2rem; } footer { flex-direction: column; text-align: center; } }
`;

const LAYOUT_ASTRO = `---
const { title, description = '', canonical = '', noIndex = false, active } = Astro.props;
const PB  = import.meta.env.PUBLIC_PB_URL  || 'http://localhost:8090';
const LANG = import.meta.env.PUBLIC_SITE_LANG || 'en';

let siteDesc = description;
let siteRobots = '';
try {
  const r = await fetch(PB + '/api/collections/site_settings/records?perPage=1');
  const d = await r.json();
  const s = d.items?.[0];
  if (s) {
    if (!siteDesc && s.site_description) siteDesc = s.site_description;
    if (s.robots) siteRobots = s.robots;
  }
} catch (e) {}
---
<!DOCTYPE html>
<html lang={LANG}>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{title} — Ichabod</title>
  {siteDesc && <meta name="description" content={siteDesc} />}
  {canonical && <link rel="canonical" href={canonical} />}
  {(noIndex || siteRobots === 'noindex') && <meta name="robots" content="noindex,nofollow" />}
  {!noIndex && siteRobots && siteRobots !== 'noindex' && <meta name="robots" content={siteRobots} />}
  <link rel="stylesheet" href="/style.css" />
</head>
<body>
  <nav>
    <a class="nav-brand" href="/"><span>◆</span> Ichabod</a>
    <div class="nav-links">
      <a href="/" style={active === 'home' ? 'color:var(--text)' : ''}>Home</a>
      <a href="/blog" style={active === 'blog' ? 'color:var(--text)' : ''}>Blog</a>
      <a href={PB + '/_/'} target="_blank">Admin ↗</a>
    </div>
  </nav>
  <main>
    <slot />
  </main>
  <footer>
    <span>Powered by <a href="https://pocketbase.io" target="_blank">PocketBase</a> + Ichabod</span>
    <span>
      <a href={PB + '/_/'} target="_blank">Admin UI</a>
      · <a href={PB + '/api/collections/posts/records'} target="_blank">API</a>
    </span>
  </footer>
</body>
</html>

<style is:global>
  @import '/style.css';
</style>
`;

const INDEX_ASTRO = `---
import Layout from '../layouts/Layout.astro';
const PB = import.meta.env.PUBLIC_PB_URL || 'http://localhost:8090';
---
<Layout title="Home" active="home">
  <section class="hero">
    <div class="hero-tag">🎉 Your CMS is live</div>
    <h1>Headless CMS.<br /><em>No nonsense.</em></h1>
    <p>PocketBase is your backend. Astro is your frontend. Edit content in the admin UI — it shows up here instantly.</p>
    <div class="hero-actions">
      <a class="btn" href="/blog">Read the docs →</a>
      <a class="btn btn-ghost" href={PB + '/_/'} target="_blank">Open Admin UI</a>
    </div>
  </section>

  <section class="features">
    <div class="features-grid">
      <div class="feature-card">
        <div class="feature-icon">⚡</div>
        <h3>Instant API</h3>
        <p>Every collection gets a REST API automatically.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🗄️</div>
        <h3>SQLite-backed</h3>
        <p>Zero-dependency database. Back it up with a single file copy.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🚀</div>
        <h3>Astro-powered</h3>
        <p>Ship zero JS by default. Add interactivity only where needed.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🤖</div>
        <h3>LLM-friendly</h3>
        <p>Astro components are easy to extend with any AI coding assistant.</p>
      </div>
    </div>
  </section>
</Layout>
`;

const BLOG_INDEX_ASTRO = `---
import Layout from '../../layouts/Layout.astro';
const PB = import.meta.env.PUBLIC_PB_URL || 'http://localhost:8090';

let posts = [];
try {
  const res = await fetch(\`\${PB}/api/collections/posts/records?sort=-published_date&perPage=50\`);
  const data = await res.json();
  posts = data.items ?? [];
} catch (e) {
  // PocketBase not reachable at build time
}
---
<Layout title="Blog" active="blog">
  <div class="page-header">
    <h1>Blog</h1>
    <p>Manage posts in the <a href={PB + '/_/'} target="_blank">PocketBase admin UI</a>.</p>
  </div>
  <div class="posts-list">
    {posts.length === 0 && (
      <div class="empty">No posts yet. <a href={PB + '/_/'} target="_blank">Add one in the admin UI.</a></div>
    )}
    {posts.map(post => {
      const date = post.published_date
        ? new Date(post.published_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : '';
      return (
        <a class="post-card" href={'/blog/' + post.slug} style="display:block;text-decoration:none;color:inherit">
          {date && <div class="post-date">{date}</div>}
          <h2><a href={'/blog/' + post.slug}>{post.title}</a></h2>
          {post.excerpt && <p>{post.excerpt}</p>}
          <span class="read-more">Read more →</span>
        </a>
      );
    })}
  </div>
</Layout>
`;

const BLOG_SLUG_ASTRO = `---
import Layout from '../../layouts/Layout.astro';
const PB = import.meta.env.PUBLIC_PB_URL || 'http://localhost:8090';

export async function getStaticPaths() {
  try {
    const res = await fetch(\`\${PB}/api/collections/posts/records?perPage=200\`);
    const data = await res.json();
    return (data.items ?? []).map(post => ({ params: { slug: post.slug }, props: { post } }));
  } catch (e) {
    return [];
  }
}

const { post } = Astro.props;
const date = post.published_date
  ? new Date(post.published_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  : '';

const seoTitle = post.seo_title || post.title;
const seoDesc  = post.seo_description || post.excerpt || '';
---
<Layout
  title={seoTitle}
  description={seoDesc}
  canonical={post.canonical_url || ''}
  noIndex={post.no_index || false}
  active="blog">
  <div class="post-single">
    <a class="back-link" href="/blog">← Back to blog</a>
    {date && <div class="post-meta"><span>{date}</span></div>}
    <h1>{post.title}</h1>
    <div class="post-body" set:html={post.body} />
  </div>
</Layout>
`;

function write(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
}

export function scaffoldAstro(webDir, lang = 'en') {
  write(path.join(webDir, 'package.json'), PACKAGE_JSON);
  write(path.join(webDir, 'astro.config.mjs'), ASTRO_CONFIG);
  write(path.join(webDir, '.env'), ENV(lang));
  write(path.join(webDir, 'public', 'style.css'), GLOBAL_CSS);
  write(path.join(webDir, 'src', 'layouts', 'Layout.astro'), LAYOUT_ASTRO);
  write(path.join(webDir, 'src', 'pages', 'index.astro'), INDEX_ASTRO);
  write(path.join(webDir, 'src', 'pages', 'blog', 'index.astro'), BLOG_INDEX_ASTRO);
  write(path.join(webDir, 'src', 'pages', 'blog', '[slug].astro'), BLOG_SLUG_ASTRO);

  log('ok', 'Astro project scaffolded → web/');

  spin('Installing Astro dependencies');
  execSync('npm install', { cwd: webDir, stdio: 'ignore' });
  stopSpin();
  log('ok', 'npm install done');

  const pbPublicDir = path.join(path.dirname(webDir), 'pb', 'pb_public');
  scaffoldAdmin(pbPublicDir);
}
