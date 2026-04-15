import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { log, spin, stopSpin } from './log.js';
import { scaffoldAdmin } from './scaffold-admin.js';

const PACKAGE_JSON = `{
  "name": "web",
  "scripts": {
    "dev": "next dev --port 3000",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  }
}
`;

const NEXT_CONFIG = `/** @type {import('next').NextConfig} */
const nextConfig = {};
export default nextConfig;
`;

const ENV_LOCAL = (lang, pbPort) => `NEXT_PUBLIC_PB_URL=http://localhost:${pbPort}
NEXT_PUBLIC_SITE_LANG=${lang}
`;

const GLOBALS_CSS = `/* Ichabod — minimal marketing theme */
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

.hero { padding: 5rem 1.5rem 4rem; max-width: var(--max); margin: 0 auto; }
.hero-tag { display: inline-block; background: rgba(167,139,250,.12); color: var(--primary); font-size: .75rem; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; padding: .25rem .75rem; border-radius: 999px; border: 1px solid rgba(167,139,250,.25); margin-bottom: 1.5rem; }
.hero h1 { font-size: clamp(2rem,5vw,3.5rem); font-weight: 800; letter-spacing: -0.04em; line-height: 1.1; margin-bottom: 1.25rem; }
.hero h1 em { color: var(--primary); font-style: normal; }
.hero p { font-size: 1.15rem; color: var(--muted); max-width: 560px; margin-bottom: 2rem; }
.hero-actions { display: flex; gap: 1rem; flex-wrap: wrap; }

.btn { display: inline-flex; align-items: center; gap: .5rem; background: var(--primary); color: #0f0f11; font-weight: 700; font-size: .95rem; padding: .65rem 1.4rem; border-radius: var(--radius); border: none; cursor: pointer; transition: opacity .15s; text-decoration: none; }
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
.post-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 1.5rem 1.75rem; transition: border-color .15s; display: block; text-decoration: none; color: inherit; }
.post-card:hover { border-color: var(--primary); text-decoration: none; }
.post-date { font-size: .8rem; color: var(--muted); margin-bottom: .5rem; }
.post-card h2 { font-size: 1.15rem; font-weight: 600; margin-bottom: .4rem; color: var(--text); }
.post-card p { font-size: .9rem; color: var(--muted); }
.read-more { display: inline-block; margin-top: .75rem; color: var(--primary); font-size: .85rem; font-weight: 500; }

.post-single { max-width: var(--max); margin: 0 auto; padding: 2.5rem 1.5rem 5rem; }
.post-meta { display: flex; align-items: center; gap: 1rem; font-size: .82rem; color: var(--muted); margin-bottom: 1.5rem; }
.post-single h1 { font-size: clamp(1.6rem,4vw,2.4rem); font-weight: 800; letter-spacing: -0.03em; margin-bottom: 1rem; }
.post-body { font-size: 1.05rem; line-height: 1.8; }
.post-body h2 { font-size: 1.35rem; font-weight: 700; margin: 2rem 0 .75rem; }
.post-body p { margin-bottom: 1rem; }
.post-body ul,.post-body ol { margin: 0 0 1rem 1.5rem; }
.post-body a { color: var(--primary); }
.post-body code { font-family: var(--mono); background: var(--surface); border: 1px solid var(--border); padding: .1em .35em; border-radius: 4px; font-size: .88em; }
.post-body pre { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 1.25rem; overflow-x: auto; margin: 1.25rem 0; }
.post-body pre code { background: none; border: none; padding: 0; }
.post-body hr { border: none; border-top: 1px solid var(--border); margin: 2rem 0; }
.back-link { display: inline-flex; align-items: center; gap: .4rem; color: var(--muted); font-size: .875rem; margin-bottom: 1.5rem; }
.back-link:hover { color: var(--text); text-decoration: none; }

.empty { text-align: center; padding: 4rem 1rem; color: var(--muted); }

footer { border-top: 1px solid var(--border); padding: 1.5rem 2rem; font-size: .82rem; color: var(--muted); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: .5rem; }
footer a { color: var(--muted); }
footer a:hover { color: var(--text); }

@media (max-width: 600px) { nav { padding: 1rem; } .hero { padding: 3rem 1rem 2rem; } footer { flex-direction: column; text-align: center; } }
`;

const LAYOUT_JS = `import './globals.css';

const PB = process.env.NEXT_PUBLIC_PB_URL || 'http://localhost:8090';

export async function generateMetadata() {
  const PB = process.env.NEXT_PUBLIC_PB_URL || 'http://localhost:8090';
  try {
    const res = await fetch(PB + '/api/collections/site_settings/records?perPage=1', { cache: 'no-store' });
    const d = await res.json();
    const s = d.items?.[0];
    if (s) return { title: s.site_title || 'Ichabod', description: s.site_description || '' };
  } catch {}
  return { title: 'Ichabod', description: '' };
}

export default function RootLayout({ children }) {
  const lang = process.env.NEXT_PUBLIC_SITE_LANG || 'en';
  return (
    <html lang={lang}>
      <body>
        <nav>
          <a className="nav-brand" href="/"><span>◆</span> Ichabod</a>
          <div className="nav-links">
            <a href="/">Home</a>
            <a href="/blog">Blog</a>
            <a href={PB + '/_/'} target="_blank" rel="noreferrer">Admin ↗</a>
          </div>
        </nav>
        <main>{children}</main>
        <footer>
          <span>Powered by <a href="https://pocketbase.io" target="_blank" rel="noreferrer">PocketBase</a> + Ichabod</span>
          <span>
            <a href={PB + '/_/'} target="_blank" rel="noreferrer">Admin UI</a>
            {' · '}
            <a href={PB + '/api/collections/posts/records'} target="_blank" rel="noreferrer">API</a>
          </span>
        </footer>
      </body>
    </html>
  );
}
`;

const HOME_PAGE_JS = `const PB = process.env.NEXT_PUBLIC_PB_URL || 'http://localhost:8090';

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero-tag">🎉 Your CMS is live</div>
        <h1>Headless CMS.<br /><em>No nonsense.</em></h1>
        <p>PocketBase is your backend. Next.js is your frontend. Edit content in the admin UI — it shows up here instantly.</p>
        <div className="hero-actions">
          <a className="btn" href="/blog">Read the docs →</a>
          <a className="btn btn-ghost" href={PB + '/_/'} target="_blank" rel="noreferrer">Open Admin UI</a>
        </div>
      </section>
      <section className="features">
        <div className="features-grid">
          <div className="feature-card"><div className="feature-icon">⚡</div><h3>Instant API</h3><p>Every collection gets a REST API automatically.</p></div>
          <div className="feature-card"><div className="feature-icon">🗄️</div><h3>SQLite-backed</h3><p>Zero-dependency database. Back it up with a single file copy.</p></div>
          <div className="feature-card"><div className="feature-icon">⚛️</div><h3>React-powered</h3><p>Full React ecosystem available. Add components as needed.</p></div>
          <div className="feature-card"><div className="feature-icon">🤖</div><h3>LLM-friendly</h3><p>Server components + plain CSS — paste any file into an AI and extend instantly.</p></div>
        </div>
      </section>
    </>
  );
}
`;

const BLOG_PAGE_JS = `const PB = process.env.NEXT_PUBLIC_PB_URL || 'http://localhost:8090';

async function getPosts() {
  try {
    const res = await fetch(\`\${PB}/api/collections/posts/records?sort=-published_date&perPage=50\`, { cache: 'no-store' });
    const data = await res.json();
    return data.items ?? [];
  } catch { return []; }
}

export default async function BlogPage() {
  const posts = await getPosts();
  return (
    <>
      <div className="page-header">
        <h1>Blog</h1>
        <p>Manage posts in the <a href={PB + '/_/'} target="_blank" rel="noreferrer">PocketBase admin UI</a>.</p>
      </div>
      <div className="posts-list">
        {posts.length === 0 && (
          <div className="empty">No posts yet. <a href={PB + '/_/'} target="_blank" rel="noreferrer">Add one in the admin UI.</a></div>
        )}
        {posts.map(post => {
          const date = post.published_date
            ? new Date(post.published_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
            : null;
          return (
            <a key={post.id} className="post-card" href={'/blog/' + post.slug}>
              {date && <div className="post-date">{date}</div>}
              <h2>{post.title}</h2>
              {post.excerpt && <p>{post.excerpt}</p>}
              <span className="read-more">Read more →</span>
            </a>
          );
        })}
      </div>
    </>
  );
}
`;

const POST_PAGE_JS = `import { notFound } from 'next/navigation';

const PB = process.env.NEXT_PUBLIC_PB_URL || 'http://localhost:8090';

export async function generateMetadata({ params }) {
  const post = await getPost(params.slug);
  if (!post) return {};
  return {
    title: (post.seo_title || post.title) + ' — Ichabod',
    description: post.seo_description || post.excerpt || '',
    ...(post.canonical_url ? { alternates: { canonical: post.canonical_url } } : {}),
    ...(post.no_index ? { robots: { index: false, follow: false } } : {}),
  };
}

async function getPost(slug) {
  try {
    const res = await fetch(\`\${PB}/api/collections/posts/records?filter=slug='\${slug}'&perPage=1\`, { cache: 'no-store' });
    const data = await res.json();
    return data.items?.[0] ?? null;
  } catch { return null; }
}

export async function generateStaticParams() {
  try {
    const res = await fetch(\`\${PB}/api/collections/posts/records?perPage=200\`);
    const data = await res.json();
    return (data.items ?? []).map(p => ({ slug: p.slug }));
  } catch { return []; }
}

export default async function PostPage({ params }) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  const date = post.published_date
    ? new Date(post.published_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  return (
    <div className="post-single">
      <a className="back-link" href="/blog">← Back to blog</a>
      {date && <div className="post-meta"><span>{date}</span></div>}
      <h1>{post.title}</h1>
      <div className="post-body" dangerouslySetInnerHTML={{ __html: post.body }} />
    </div>
  );
}
`;

function write(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
}

export function scaffoldNextJs(webDir, lang = 'en', pbPort = 8090) {
  write(path.join(webDir, 'package.json'), PACKAGE_JSON);
  write(path.join(webDir, 'next.config.mjs'), NEXT_CONFIG);
  write(path.join(webDir, '.env.local'), ENV_LOCAL(lang, pbPort));
  write(path.join(webDir, 'src', 'app', 'globals.css'), GLOBALS_CSS);
  write(path.join(webDir, 'src', 'app', 'layout.js'), LAYOUT_JS);
  write(path.join(webDir, 'src', 'app', 'page.js'), HOME_PAGE_JS);
  write(path.join(webDir, 'src', 'app', 'blog', 'page.js'), BLOG_PAGE_JS);
  write(path.join(webDir, 'src', 'app', 'blog', '[slug]', 'page.js'), POST_PAGE_JS);

  log('ok', 'Next.js project scaffolded → web/');

  spin('Installing Next.js dependencies');
  execSync('npm install', { cwd: webDir, stdio: 'ignore' });
  stopSpin();
  log('ok', 'npm install done');

  const pbPublicDir = path.join(path.dirname(webDir), 'pb', 'pb_public');
  scaffoldAdmin(pbPublicDir);
}
