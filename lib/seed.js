import { httpPost } from './setup.js';
import { log, spin, stopSpin } from './log.js';

function getPost1(pbUrl) {
  return {
    title: 'Welcome to Ichabod: What Just Happened?',
    slug: 'welcome-to-ichabod',
    excerpt: 'A quick tour of the stack Ichabod just spun up for you.',
    body: `<h2>Congratulations — your CMS is running.</h2>

<p>Here's what Ichabod just did in under 2 minutes:</p>

<ul>
  <li><strong>Downloaded PocketBase</strong> — a self-contained backend with a built-in SQLite database, REST API, and file storage.</li>
  <li><strong>Created a superuser account</strong> — the credentials you entered are your admin login.</li>
  <li><strong>Scaffolded a <code>posts</code> collection</strong> — with fields for <code>title</code>, <code>slug</code>, <code>body</code>, <code>excerpt</code>, and <code>published_date</code>.</li>
  <li><strong>Seeded this site</strong> with two starter posts (you're reading the first one).</li>
  <li><strong>Deployed a static marketing site</strong> served directly by PocketBase from <code>pb/pb_public/</code>.</li>
</ul>

<h2>Key URLs</h2>
<ul>
  <li><strong>Your site:</strong> <a href="${pbUrl}">${pbUrl}</a></li>
  <li><strong>Blog:</strong> <a href="${pbUrl}/blog/">${pbUrl}/blog/</a></li>
  <li><strong>PocketBase Admin UI:</strong> <a href="${pbUrl}/_">${pbUrl}/_/</a></li>
  <li><strong>API:</strong> <a href="${pbUrl}/api/collections/posts/records">${pbUrl}/api/collections/posts/records</a></li>
</ul>

<h2>How to manage content</h2>
<p>Open the <a href="${pbUrl}/_">PocketBase Admin UI</a>, log in with your credentials, and click on the <strong>posts</strong> collection to add, edit, or delete content. Changes are live instantly — no rebuilds needed.</p>

<h2>Project layout</h2>
<pre>
your-project/
├── pb/
│   ├── pocketbase        ← the binary
│   ├── pb_data/          ← database + uploads
│   └── pb_public/        ← this site (edit freely)
└── pb.config.json        ← schema snapshot
</pre>

<p>Read the second post to learn how to use an LLM to build out the rest of your site.</p>`,
    published_date: new Date().toISOString().split('T')[0] + ' 09:00:00'
  };
}

function getPost2(pbUrl) {
  return {
    title: 'Building the Rest with an LLM: A Prompt Guide',
    slug: 'building-with-llm',
    excerpt: 'Copy-paste prompts to extend your Ichabod site using any AI coding assistant.',
    body: `<h2>You have a running CMS. Now what?</h2>

<p>The files in <code>pb/pb_public/</code> are plain HTML, CSS, and vanilla JavaScript. Any LLM can read and extend them with no framework knowledge required. Below are ready-to-use prompts.</p>

<hr/>

<h2>Prompt: Add a new page</h2>
<pre>
I have a static HTML/CSS site in pb/pb_public/.
The site fetches data from a PocketBase API at ${pbUrl}.
Please create a new page called "services.html" with the same nav and footer
as index.html, and a grid of service cards I can fill in manually.
</pre>

<hr/>

<h2>Prompt: Add a new collection + auto-page</h2>
<pre>
I'm using PocketBase as my CMS. I want to add a new collection called "projects"
with fields: title (text), description (editor), image (file), url (url), tags (text).
1. Write the PocketBase API call to create this collection (I'll run it via curl or the admin UI).
2. Create a new file pb/pb_public/projects/index.html that lists all projects
   fetched from ${pbUrl}/api/collections/projects/records.
   Match the style of pb/pb_public/blog/index.html.
</pre>

<hr/>

<h2>Prompt: Customise the theme</h2>
<pre>
I have a marketing site in pb/pb_public/style.css using CSS custom properties.
Please update the theme to use these brand colours:
  --color-primary: #2563EB
  --color-accent: #F59E0B
  --font-heading: 'Inter', sans-serif
Add a Google Fonts import for Inter at the top of the CSS file.
</pre>

<hr/>

<h2>Prompt: Deploy to production</h2>
<pre>
I have a PocketBase instance with a pb/ directory.
I want to deploy it to Fly.io as a single-machine app.
The binary is at pb/pocketbase, data is at pb/pb_data, and the public site is at pb/pb_public.
Please write a Dockerfile and fly.toml for this setup with persistent volume for pb_data.
</pre>

<hr/>

<h2>Tips for working with AI assistants</h2>
<ul>
  <li>Always share the relevant HTML/CSS file contents with the LLM — paste them directly into the prompt.</li>
  <li>Tell the LLM that your API base URL is <code>${pbUrl}</code> (or your production domain).</li>
  <li>Ask for "vanilla JS only — no build step" to keep things compatible with this setup.</li>
  <li>The PocketBase API docs are at <a href="https://pocketbase.io/docs/api-records/">pocketbase.io/docs</a> — share relevant sections with the LLM for complex queries.</li>
</ul>`,
    published_date: new Date().toISOString().split('T')[0] + ' 09:01:00'
  };
}

export async function seedSiteSettings(token, siteName, lang, pbUrl) {
  spin('Seeding site settings');
  const res = await httpPost(`${pbUrl}/api/collections/site_settings/records`, {
    site_title:       siteName,
    site_description: '',
    lang,
    robots:           'index,follow',
  }, token);
  stopSpin();
  if (res.status !== 200 && res.status !== 201) {
    log('warn', 'Could not seed site_settings — skipping');
    return;
  }
  log('ok', 'site_settings seeded');
}

export async function seedPosts(token, pbUrl) {
  spin('Seeding starter posts');

  for (const post of [getPost1(pbUrl), getPost2(pbUrl)]) {
    const res = await httpPost(`${pbUrl}/api/collections/posts/records`, post, token);
    if (res.status !== 200 && res.status !== 201) {
      if (JSON.stringify(res.body).includes('slug')) {
        continue;
      }
      throw new Error(`Failed to seed post "${post.title}": ${JSON.stringify(res.body)}`);
    }
  }

  stopSpin();
  log('ok', '2 starter posts seeded');
}
