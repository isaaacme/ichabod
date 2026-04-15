import fs from 'fs';
import path from 'path';
import { log } from './log.js';
import { scaffoldAdmin } from './scaffold-admin.js';

const CSS = `/* Ichabod — minimal marketing theme */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg:        #0f0f11;
  --surface:   #18181b;
  --border:    #27272a;
  --text:      #e4e4e7;
  --muted:     #71717a;
  --primary:   #a78bfa;
  --accent:    #34d399;
  --danger:    #f87171;
  --radius:    8px;
  --font:      system-ui, -apple-system, 'Segoe UI', sans-serif;
  --mono:      'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
  --max:       860px;
}

body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--font);
  font-size: 1rem;
  line-height: 1.7;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

a { color: var(--primary); text-decoration: none; }
a:hover { text-decoration: underline; }

/* ── Nav ── */
nav {
  border-bottom: 1px solid var(--border);
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 100%;
}
.nav-brand {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.02em;
}
.nav-brand span { color: var(--primary); }
.nav-links { display: flex; gap: 1.5rem; }
.nav-links a { color: var(--muted); font-size: 0.9rem; }
.nav-links a:hover { color: var(--text); text-decoration: none; }

/* ── Main content ── */
main { flex: 1; }
.container { max-width: var(--max); margin: 0 auto; padding: 0 1.5rem; }

/* ── Hero ── */
.hero {
  padding: 5rem 1.5rem 4rem;
  max-width: var(--max);
  margin: 0 auto;
}
.hero-tag {
  display: inline-block;
  background: rgba(167,139,250,.12);
  color: var(--primary);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: .08em;
  text-transform: uppercase;
  padding: .25rem .75rem;
  border-radius: 999px;
  border: 1px solid rgba(167,139,250,.25);
  margin-bottom: 1.5rem;
}
.hero h1 {
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 1.1;
  margin-bottom: 1.25rem;
}
.hero h1 em { color: var(--primary); font-style: normal; }
.hero p {
  font-size: 1.15rem;
  color: var(--muted);
  max-width: 560px;
  margin-bottom: 2rem;
}
.btn {
  display: inline-flex;
  align-items: center;
  gap: .5rem;
  background: var(--primary);
  color: #0f0f11;
  font-weight: 700;
  font-size: 0.95rem;
  padding: .65rem 1.4rem;
  border-radius: var(--radius);
  border: none;
  cursor: pointer;
  transition: opacity .15s;
}
.btn:hover { opacity: .88; text-decoration: none; }
.btn-ghost {
  background: transparent;
  color: var(--muted);
  border: 1px solid var(--border);
}
.btn-ghost:hover { color: var(--text); }
.hero-actions { display: flex; gap: 1rem; flex-wrap: wrap; }

/* ── Features grid ── */
.features {
  padding: 3rem 1.5rem 5rem;
  max-width: var(--max);
  margin: 0 auto;
}
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
  margin-top: 2rem;
}
.feature-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.5rem;
}
.feature-icon { font-size: 1.5rem; margin-bottom: .75rem; }
.feature-card h3 { font-size: 1rem; font-weight: 600; margin-bottom: .4rem; }
.feature-card p { font-size: .875rem; color: var(--muted); }

/* ── Blog list ── */
.page-header {
  padding: 3rem 1.5rem 1.5rem;
  max-width: var(--max);
  margin: 0 auto;
}
.page-header h1 { font-size: 2rem; font-weight: 700; letter-spacing: -0.03em; }
.page-header p { color: var(--muted); margin-top: .5rem; }

.posts-list {
  max-width: var(--max);
  margin: 0 auto;
  padding: .5rem 1.5rem 5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.post-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.5rem 1.75rem;
  transition: border-color .15s;
  cursor: pointer;
}
.post-card:hover { border-color: var(--primary); }
.post-date { font-size: .8rem; color: var(--muted); margin-bottom: .5rem; }
.post-card h2 { font-size: 1.15rem; font-weight: 600; margin-bottom: .4rem; }
.post-card p { font-size: .9rem; color: var(--muted); }
.post-card a { color: inherit; }
.post-card a:hover { text-decoration: none; }
.read-more { display: inline-block; margin-top: .75rem; color: var(--primary); font-size: .85rem; font-weight: 500; }

/* ── Single post ── */
.post-single {
  max-width: var(--max);
  margin: 0 auto;
  padding: 2.5rem 1.5rem 5rem;
}
.post-single .post-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: .82rem;
  color: var(--muted);
  margin-bottom: 1.5rem;
}
.post-single h1 {
  font-size: clamp(1.6rem, 4vw, 2.4rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  margin-bottom: 1rem;
}
.post-body { font-size: 1.05rem; line-height: 1.8; }
.post-body h2 { font-size: 1.35rem; font-weight: 700; margin: 2rem 0 .75rem; }
.post-body h3 { font-size: 1.1rem; font-weight: 600; margin: 1.5rem 0 .5rem; }
.post-body p { margin-bottom: 1rem; }
.post-body ul, .post-body ol { margin: 0 0 1rem 1.5rem; }
.post-body li { margin-bottom: .3rem; }
.post-body a { color: var(--primary); }
.post-body code { font-family: var(--mono); background: var(--surface); border: 1px solid var(--border); padding: .1em .35em; border-radius: 4px; font-size: .88em; }
.post-body pre { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 1.25rem; overflow-x: auto; margin: 1.25rem 0; }
.post-body pre code { background: none; border: none; padding: 0; font-size: .9em; }
.post-body hr { border: none; border-top: 1px solid var(--border); margin: 2rem 0; }
.back-link { display: inline-flex; align-items: center; gap: .4rem; color: var(--muted); font-size: .875rem; margin-bottom: 1.5rem; }
.back-link:hover { color: var(--text); text-decoration: none; }

/* ── Loading / empty states ── */
.state { text-align: center; padding: 4rem 1rem; color: var(--muted); }
.state-icon { font-size: 2.5rem; margin-bottom: 1rem; }

/* ── Footer ── */
footer {
  border-top: 1px solid var(--border);
  padding: 1.5rem 2rem;
  font-size: .82rem;
  color: var(--muted);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: .5rem;
}
footer a { color: var(--muted); }
footer a:hover { color: var(--text); }

@media (max-width: 600px) {
  nav { padding: 1rem; }
  .hero { padding: 3rem 1rem 2rem; }
  footer { flex-direction: column; text-align: center; }
}
`;

const NAV = (active, pbPort) => `<nav>
    <a class="nav-brand" href="/"><span>◆</span> Ichabod</a>
    <div class="nav-links">
      <a href="/" ${active === 'home' ? 'style="color:var(--text)"' : ''}>Home</a>
      <a href="/blog/" ${active === 'blog' ? 'style="color:var(--text)"' : ''}>Blog</a>
      <a href="http://localhost:${pbPort}/_/" target="_blank">Admin ↗</a>
    </div>
  </nav>`;

const FOOTER = (pbPort) => `<footer>
    <span>Powered by <a href="https://pocketbase.io" target="_blank">PocketBase</a> + Ichabod</span>
    <span><a href="http://localhost:${pbPort}/_/" target="_blank">Admin UI</a> · <a href="http://localhost:${pbPort}/api/collections/posts/records" target="_blank">API</a></span>
  </footer>`;

const INDEX_HTML = (lang, pbPort) => `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Ichabod — Your new headless CMS</title>
  <meta name="description" content=""/>
  <link rel="stylesheet" href="/style.css"/>
  <script src="/seo.js"><\/script>
</head>
<body>
  ${NAV('home', pbPort)}
  <main>
    <section class="hero">
      <div class="hero-tag">🎉 Your CMS is live</div>
      <h1>Headless CMS.<br/><em>No nonsense.</em></h1>
      <p>PocketBase is running locally. Your content is editable from the admin UI and served instantly via the API.</p>
      <div class="hero-actions">
        <a class="btn" href="/blog/">Read the docs →</a>
        <a class="btn btn-ghost" href="http://localhost:${pbPort}/_/" target="_blank">Open Admin UI</a>
      </div>
    </section>

    <section class="features">
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">⚡</div>
          <h3>Instant API</h3>
          <p>Every collection gets a REST API automatically. No configuration needed.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🗄️</div>
          <h3>SQLite-backed</h3>
          <p>Zero-dependency database. Back it up with a single file copy.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🔒</div>
          <h3>Auth built-in</h3>
          <p>User collections, rules, and JWT auth are part of PocketBase by default.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🤖</div>
          <h3>LLM-friendly</h3>
          <p>Plain HTML + vanilla JS. Paste any file into an AI and extend instantly.</p>
        </div>
      </div>
    </section>
  </main>
  ${FOOTER(pbPort)}
</body>
</html>`;

const BLOG_INDEX_HTML = (lang, pbPort) => `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Blog — Ichabod</title>
  <meta name="description" content=""/>
  <link rel="stylesheet" href="/style.css"/>
  <script src="/seo.js"><\/script>
</head>
<body>
  ${NAV('blog', pbPort)}
  <main>
    <div class="page-header">
      <h1>Blog</h1>
      <p>Manage posts in the <a href="http://localhost:${pbPort}/_/" target="_blank">PocketBase admin UI</a>.</p>
    </div>
    <div class="posts-list" id="posts">
      <div class="state"><div class="state-icon">⏳</div>Loading posts…</div>
    </div>
  </main>
  ${FOOTER(pbPort)}

  <script>
    const PB = 'http://localhost:${pbPort}';

    async function loadPosts() {
      const container = document.getElementById('posts');
      try {
        const res = await fetch(PB + '/api/collections/posts/records?sort=-published_date&perPage=50');
        const data = await res.json();
        if (!data.items || data.items.length === 0) {
          container.innerHTML = '<div class="state"><div class="state-icon">📭</div>No posts yet. <a href="' + PB + '/_/" target="_blank">Add one in the admin UI.</a></div>';
          return;
        }
        container.innerHTML = data.items.map(post => {
          const date = post.published_date ? new Date(post.published_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '';
          return \`
            <div class="post-card" onclick="location.href='/post.html?id=\${post.id}'">
              \${date ? '<div class="post-date">' + date + '</div>' : ''}
              <h2><a href="/post.html?id=\${post.id}">\${post.title}</a></h2>
              \${post.excerpt ? '<p>' + post.excerpt + '</p>' : ''}
              <span class="read-more">Read more →</span>
            </div>
          \`;
        }).join('');
      } catch (e) {
        container.innerHTML = '<div class="state"><div class="state-icon">⚠️</div>Could not load posts. Is PocketBase running?</div>';
      }
    }

    loadPosts();
  </script>
</body>
</html>`;

const POST_HTML = (lang, pbPort) => `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Post — Ichabod</title>
  <meta name="description" content=""/>
  <link rel="stylesheet" href="/style.css"/>
</head>
<body>
  ${NAV('blog', pbPort)}
  <main>
    <div class="post-single" id="post-wrap">
      <div class="state"><div class="state-icon">⏳</div>Loading post…</div>
    </div>
  </main>
  ${FOOTER(pbPort)}

  <script>
    const PB = 'http://localhost:${pbPort}';

    async function loadPost() {
      const wrap = document.getElementById('post-wrap');
      const params = new URLSearchParams(location.search);
      const id = params.get('id');
      if (!id) { wrap.innerHTML = '<div class="state"><div class="state-icon">🔍</div>No post ID provided.</div>'; return; }

      try {
        const res = await fetch(PB + '/api/collections/posts/records/' + id);
        if (!res.ok) throw new Error('Not found');
        const post = await res.json();

        const date = post.published_date
          ? new Date(post.published_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
          : '';

        const seoTitle = post.seo_title || post.title;
        document.title = seoTitle + ' — Ichabod';

        const descEl = document.querySelector('meta[name="description"]');
        if (descEl) descEl.content = post.seo_description || post.excerpt || '';

        if (post.canonical_url) {
          let link = document.querySelector('link[rel="canonical"]');
          if (!link) { link = document.createElement('link'); link.rel = 'canonical'; document.head.appendChild(link); }
          link.href = post.canonical_url;
        }
        if (post.no_index) {
          let rm = document.querySelector('meta[name="robots"]');
          if (!rm) { rm = document.createElement('meta'); rm.name = 'robots'; document.head.appendChild(rm); }
          rm.content = 'noindex,nofollow';
        }

        wrap.innerHTML = \`
          <a class="back-link" href="/blog/">← Back to blog</a>
          <div class="post-meta">
            \${date ? '<span>' + date + '</span>' : ''}
          </div>
          <h1>\${post.title}</h1>
          <div class="post-body">\${post.body || ''}</div>
        \`;
      } catch (e) {
        wrap.innerHTML = '<div class="state"><div class="state-icon">⚠️</div>Post not found.</div>';
      }
    }

    loadPost();
  </script>
</body>
</html>`;

const SEO_JS = `
// Fetches site_settings and applies global SEO meta tags
(async function () {
  try {
    const r = await fetch('/api/collections/site_settings/records?perPage=1');
    const d = await r.json();
    const s = d.items && d.items[0];
    if (!s) return;
    const descEl = document.querySelector('meta[name="description"]');
    if (descEl && !descEl.content && s.site_description) descEl.content = s.site_description;
    if (s.robots) {
      let m = document.querySelector('meta[name="robots"]');
      if (!m) { m = document.createElement('meta'); m.name = 'robots'; document.head.appendChild(m); }
      if (!m.content) m.content = s.robots;
    }
  } catch (e) {}
})();
`;

export function scaffoldStatic(pbPublicDir, lang = 'en', pbPort = 8090) {
  fs.mkdirSync(path.join(pbPublicDir, 'blog'), { recursive: true });

  fs.writeFileSync(path.join(pbPublicDir, 'style.css'), CSS);
  fs.writeFileSync(path.join(pbPublicDir, 'seo.js'), SEO_JS);
  fs.writeFileSync(path.join(pbPublicDir, 'index.html'), INDEX_HTML(lang, pbPort));
  fs.writeFileSync(path.join(pbPublicDir, 'blog', 'index.html'), BLOG_INDEX_HTML(lang, pbPort));
  fs.writeFileSync(path.join(pbPublicDir, 'post.html'), POST_HTML(lang, pbPort));

  log('ok', 'Static site scaffolded → pb/pb_public/');
  scaffoldAdmin(pbPublicDir, pbPort);
}
