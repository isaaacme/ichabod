
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
