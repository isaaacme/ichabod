import fs from 'fs';
import path from 'path';
import { log } from './log.js';

// ─── i18n locale files ──────────────────────────────────────────────────────

const EN = {
  "nav.collections": "Collections",
  "nav.settings": "Settings",
  "nav.logout": "Logout",
  "page.dashboard": "Dashboard",
  "page.settings": "Settings",
  "action.new": "+ New",
  "action.edit": "Edit",
  "action.delete": "Delete",
  "action.save": "Save",
  "action.cancel": "Cancel",
  "action.search": "Search…",
  "action.reset": "Reset to defaults",
  "confirm.delete": "Delete this record?",
  "settings.theme": "Theme",
  "settings.i18n": "i18n",
  "settings.fields": "Fields",
  "settings.ui_lang": "UI Language",
  "settings.content_locales": "Content locales",
  "label.records": "records",
  "label.loading": "Loading…",
  "label.empty": "No records yet.",
  "label.page": "Page",
  "label.of": "of"
};

const FR = {
  "nav.collections": "Collections",
  "nav.settings": "Paramètres",
  "nav.logout": "Déconnexion",
  "page.dashboard": "Tableau de bord",
  "page.settings": "Paramètres",
  "action.new": "+ Nouveau",
  "action.edit": "Modifier",
  "action.delete": "Supprimer",
  "action.save": "Enregistrer",
  "action.cancel": "Annuler",
  "action.search": "Rechercher…",
  "action.reset": "Réinitialiser",
  "confirm.delete": "Supprimer cet enregistrement ?",
  "settings.theme": "Thème",
  "settings.i18n": "i18n",
  "settings.fields": "Champs",
  "settings.ui_lang": "Langue de l'interface",
  "settings.content_locales": "Langues du contenu",
  "label.records": "enregistrements",
  "label.loading": "Chargement…",
  "label.empty": "Aucun enregistrement.",
  "label.page": "Page",
  "label.of": "sur"
};

const ES = {
  "nav.collections": "Colecciones",
  "nav.settings": "Ajustes",
  "nav.logout": "Cerrar sesión",
  "page.dashboard": "Panel",
  "page.settings": "Ajustes",
  "action.new": "+ Nuevo",
  "action.edit": "Editar",
  "action.delete": "Eliminar",
  "action.save": "Guardar",
  "action.cancel": "Cancelar",
  "action.search": "Buscar…",
  "action.reset": "Restablecer",
  "confirm.delete": "¿Eliminar este registro?",
  "settings.theme": "Tema",
  "settings.i18n": "i18n",
  "settings.fields": "Campos",
  "settings.ui_lang": "Idioma de la interfaz",
  "settings.content_locales": "Idiomas del contenido",
  "label.records": "registros",
  "label.loading": "Cargando…",
  "label.empty": "Sin registros.",
  "label.page": "Página",
  "label.of": "de"
};

// ─── admin.css ──────────────────────────────────────────────────────────────

const ADMIN_CSS = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg:      #0f0f11;
  --surface: #18181b;
  --border:  #27272a;
  --text:    #e4e4e7;
  --muted:   #71717a;
  --primary: #a78bfa;
  --accent:  #34d399;
  --danger:  #f87171;
  --radius:  8px;
  --font:    system-ui, -apple-system, 'Segoe UI', sans-serif;
  --mono:    'JetBrains Mono', 'Fira Code', monospace;
  --sidebar: 220px;
}

html, body { height: 100%; }
body { background: var(--bg); color: var(--text); font-family: var(--font); font-size: .9rem; line-height: 1.5; }
a { color: var(--primary); text-decoration: none; cursor: pointer; }
[x-cloak] { display: none !important; }

/* ── Layout ── */
.app { display: flex; height: 100vh; overflow: hidden; }

.sidebar {
  width: var(--sidebar); min-width: var(--sidebar);
  background: var(--surface); border-right: 1px solid var(--border);
  display: flex; flex-direction: column; overflow-y: auto;
}
.sidebar-brand {
  padding: 1.25rem 1rem 1rem;
  font-size: 1rem; font-weight: 700; letter-spacing: -0.02em;
  color: var(--text); border-bottom: 1px solid var(--border);
  display: flex; align-items: center; gap: .5rem;
}
.sidebar-brand .brand-icon { color: var(--primary); }
.sidebar-brand .brand-sub { font-size: .7rem; font-weight: 400; color: var(--muted); margin-top: .1rem; }

.sidebar-nav { flex: 1; padding: .75rem 0; overflow-y: auto; }
.nav-section { padding: .5rem 1rem .25rem; font-size: .7rem; font-weight: 600;
  letter-spacing: .08em; text-transform: uppercase; color: var(--muted); }
.nav-item {
  display: flex; align-items: center; gap: .5rem;
  padding: .45rem 1rem; font-size: .875rem; color: var(--muted);
  border-radius: 0; transition: background .1s, color .1s; cursor: pointer;
}
.nav-item:hover { background: rgba(255,255,255,.04); color: var(--text); }
.nav-item.active { background: rgba(167,139,250,.12); color: var(--primary); font-weight: 500; }

.sidebar-footer { padding: .75rem 0; border-top: 1px solid var(--border); }
.btn-logout {
  width: 100%; display: flex; align-items: center; gap: .5rem; padding: .45rem 1rem;
  font-size: .875rem; color: var(--muted); background: none; border: none; cursor: pointer; text-align: left;
}
.btn-logout:hover { color: var(--danger); }
.locale-select {
  padding: .45rem 1rem;
}
.locale-select select {
  background: var(--surface); border: 1px solid var(--border); color: var(--text);
  border-radius: var(--radius); padding: .2rem .5rem; font-size: .8rem; cursor: pointer;
}

.content { flex: 1; overflow-y: auto; display: flex; flex-direction: column; }

/* ── Login ── */
.login-wrap {
  min-height: 100vh; display: flex; align-items: center; justify-content: center;
  background: var(--bg);
}
.login-card {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 12px; padding: 2rem; width: 100%; max-width: 360px;
  display: flex; flex-direction: column; gap: 1.1rem;
}
.login-logo { font-size: 1.2rem; font-weight: 700; text-align: center; margin-bottom: .5rem; }
.login-logo span { color: var(--primary); }

/* ── Page header ── */
.page-header {
  padding: 1.5rem 1.75rem 1rem;
  display: flex; align-items: center; justify-content: space-between;
  border-bottom: 1px solid var(--border);
}
.page-header h1 { font-size: 1.3rem; font-weight: 700; letter-spacing: -0.02em; }
.breadcrumb { display: flex; align-items: center; gap: .5rem; font-size: .9rem; color: var(--muted); }
.breadcrumb a { color: var(--primary); }
.breadcrumb span { color: var(--text); font-weight: 600; }

/* ── Toolbar ── */
.toolbar { padding: .75rem 1.75rem; display: flex; gap: .75rem; align-items: center; }
.search-input {
  background: var(--surface); border: 1px solid var(--border); color: var(--text);
  border-radius: var(--radius); padding: .45rem .75rem; font-size: .875rem; width: 260px;
}
.search-input:focus { outline: none; border-color: var(--primary); }

/* ── Dashboard ── */
.collection-grid {
  padding: 1.25rem 1.75rem;
  display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 1rem;
}
.collection-card {
  background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius);
  padding: 1.25rem; cursor: pointer; transition: border-color .15s, transform .1s;
}
.collection-card:hover { border-color: var(--primary); transform: translateY(-1px); }
.collection-icon { font-size: 1.5rem; margin-bottom: .5rem; }
.collection-card h3 { font-size: .95rem; font-weight: 600; margin-bottom: .3rem; }
.collection-count { font-size: .8rem; color: var(--muted); }

/* ── Table ── */
.table-wrap { padding: 0 1.75rem 1.75rem; overflow-x: auto; }
.table {
  width: 100%; border-collapse: collapse; font-size: .875rem;
}
.table th {
  text-align: left; padding: .65rem .75rem; font-size: .75rem; font-weight: 600;
  letter-spacing: .05em; text-transform: uppercase; color: var(--muted);
  border-bottom: 1px solid var(--border);
}
.table td { padding: .65rem .75rem; border-bottom: 1px solid var(--border); color: var(--text); }
.table tr:hover td { background: rgba(255,255,255,.02); }
.table tr:last-child td { border-bottom: none; }
.row-actions { display: flex; gap: .4rem; justify-content: flex-end; }

.empty { padding: 3rem; text-align: center; color: var(--muted); }
.loading { padding: 2rem; text-align: center; color: var(--muted); font-style: italic; }

.pagination {
  padding: .75rem 1.75rem;
  display: flex; align-items: center; gap: .75rem; font-size: .85rem; color: var(--muted);
  border-top: 1px solid var(--border);
}

/* ── Buttons ── */
.btn {
  display: inline-flex; align-items: center; gap: .4rem;
  background: var(--surface); color: var(--text);
  border: 1px solid var(--border); border-radius: var(--radius);
  padding: .45rem .9rem; font-size: .85rem; font-weight: 500;
  cursor: pointer; transition: background .1s, border-color .1s; white-space: nowrap;
}
.btn:hover { background: rgba(255,255,255,.06); }
.btn:disabled { opacity: .45; cursor: not-allowed; }
.btn-primary { background: var(--primary); color: #0f0f11; border-color: var(--primary); }
.btn-primary:hover { opacity: .88; background: var(--primary); }
.btn-danger { color: var(--danger); border-color: rgba(248,113,113,.3); }
.btn-danger:hover { background: rgba(248,113,113,.1); }
.btn-sm { padding: .3rem .65rem; font-size: .8rem; }

/* ── Form ── */
.edit-form { padding: 1.25rem 1.75rem; max-width: 720px; display: flex; flex-direction: column; gap: 1.1rem; }
.form-group { display: flex; flex-direction: column; gap: .35rem; }
.form-group label { font-size: .82rem; font-weight: 600; color: var(--muted); }
.required { color: var(--danger); margin-left: .2rem; }

.input {
  background: var(--surface); border: 1px solid var(--border); color: var(--text);
  border-radius: var(--radius); padding: .55rem .75rem; font-size: .9rem;
  font-family: var(--font); width: 100%; transition: border-color .15s;
}
.input:focus { outline: none; border-color: var(--primary); }
.input-sm { width: auto; }
.textarea { resize: vertical; min-height: 100px; font-family: var(--mono); font-size: .85rem; }

.alert { background: rgba(248,113,113,.12); border: 1px solid rgba(248,113,113,.3);
  color: var(--danger); border-radius: var(--radius); padding: .65rem .75rem; font-size: .875rem; }
.field-error { color: var(--danger); font-size: .8rem; }

.form-actions { display: flex; gap: .75rem; padding-top: .5rem; }

/* ── Collection Builder ── */
.builder-form { padding: 1.25rem 1.75rem; max-width: 900px; display: flex; flex-direction: column; gap: 1.5rem; }
.builder-form h3 { font-size: .95rem; font-weight: 600; margin: 0; }
.field-types { display: flex; flex-wrap: wrap; gap: .5rem; }
.field-type-btn { 
  display: flex; flex-direction: column; align-items: center; gap: .25rem;
  padding: .75rem 1rem; background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius); cursor: pointer; transition: all .15s;
  font-size: .75rem; min-width: 70px;
}
.field-type-btn:hover { border-color: var(--primary); background: rgba(62, 207, 142, .1); }
.builder-fields { display: flex; flex-direction: column; gap: .5rem; }
.builder-field-row { 
  display: flex; align-items: center; gap: .75rem; 
  padding: .75rem; background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius);
}
.builder-field-row input { flex: 1; min-width: 120px; }
.builder-field-row select { width: 120px; }
.builder-field-row label { font-size: .8rem; display: flex; align-items: center; gap: .25rem; white-space: nowrap; }
.seo-note { font-size: .85rem; color: var(--muted); margin: 0; }
.seo-section { border: 1px solid var(--border); border-radius: var(--radius); padding: 1rem; background: rgba(62, 207, 142, .05); }
.seo-section h3 { font-size: .9rem; margin: 0 0 .75rem; color: var(--primary); }

/* ── Toggle ── */
.toggle { display: flex; align-items: center; gap: .5rem; cursor: pointer; width: fit-content; }
.toggle input { display: none; }
.toggle-slider {
  width: 36px; height: 20px; background: var(--border); border-radius: 999px;
  position: relative; transition: background .2s;
}
.toggle-slider::after {
  content: ''; position: absolute; top: 3px; left: 3px;
  width: 14px; height: 14px; background: #fff; border-radius: 50%; transition: transform .2s;
}
.toggle input:checked + .toggle-slider { background: var(--primary); }
.toggle input:checked + .toggle-slider::after { transform: translateX(16px); }

/* ── Editor ── */
.editor-wrap { border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }
.editor-toolbar {
  display: flex; gap: .25rem; padding: .4rem .5rem;
  border-bottom: 1px solid var(--border); background: var(--surface);
}
.editor-toolbar button {
  background: none; border: none; color: var(--muted); padding: .2rem .45rem;
  border-radius: 4px; cursor: pointer; font-size: .9rem;
}
.editor-toolbar button:hover { background: rgba(255,255,255,.08); color: var(--text); }
.editor-content {
  min-height: 160px; padding: .75rem; background: var(--bg);
  color: var(--text); font-size: .9rem; line-height: 1.7;
  outline: none;
}
.editor-content a { color: var(--primary); }
.editor-content ul, .editor-content ol { padding-left: 1.25rem; }

/* ── File ── */
.file-wrap { display: flex; flex-direction: column; gap: .4rem; }
.current-file { font-size: .8rem; color: var(--muted); }
.current-file a { color: var(--primary); }

/* ── Locale tabs ── */
.locale-tabs { display: flex; gap: .25rem; padding-bottom: .5rem; border-bottom: 1px solid var(--border); margin-bottom: .5rem; }
.locale-tabs button {
  background: none; border: 1px solid var(--border); color: var(--muted);
  border-radius: var(--radius); padding: .25rem .65rem; font-size: .8rem;
  font-weight: 600; cursor: pointer; letter-spacing: .04em;
}
.locale-tabs button.active { background: var(--primary); color: #0f0f11; border-color: var(--primary); }

/* ── Settings ── */
.settings-tabs { display: flex; gap: 0; border-bottom: 1px solid var(--border); padding: 0 1.75rem; }
.settings-tabs button {
  background: none; border: none; border-bottom: 2px solid transparent;
  padding: .75rem 1rem; font-size: .875rem; color: var(--muted);
  cursor: pointer; margin-bottom: -1px;
}
.settings-tabs button.active { color: var(--primary); border-bottom-color: var(--primary); }

.settings-section { padding: 1.5rem 1.75rem; max-width: 600px; display: flex; flex-direction: column; gap: 1.25rem; }
.hint { font-size: .8rem; color: var(--muted); margin-top: .25rem; }

.theme-row { flex-direction: row; align-items: center; justify-content: space-between; }
.theme-row label { font-size: .85rem; color: var(--text); min-width: 140px; }
.theme-input-row { display: flex; gap: .5rem; align-items: center; }
.theme-input-row input[type=color] { width: 36px; height: 32px; border: none; background: none; cursor: pointer; border-radius: 4px; }
.theme-input-row .input { width: 140px; }

.locale-list { display: flex; flex-direction: column; gap: .4rem; margin: .5rem 0; }
.locale-row { display: flex; gap: .5rem; align-items: center; }

.field-config-row {
  display: flex; align-items: center; gap: 1rem; padding: .6rem 0;
  border-bottom: 1px solid var(--border); flex-wrap: wrap;
}
.field-name { font-weight: 600; font-size: .875rem; min-width: 140px; }
.field-config-row label { display: flex; align-items: center; gap: .35rem; font-size: .82rem; color: var(--muted); }

/* ── Toast ── */
.toast-container { position: fixed; bottom: 1.5rem; right: 1.5rem; display: flex; flex-direction: column; gap: .5rem; z-index: 9999; }
.toast {
  background: var(--surface); border: 1px solid var(--border); color: var(--text);
  border-radius: var(--radius); padding: .65rem 1rem; font-size: .875rem;
  box-shadow: 0 4px 24px rgba(0,0,0,.4); max-width: 320px;
}
.toast-success { border-color: var(--accent); color: var(--accent); }
.toast-error { border-color: var(--danger); color: var(--danger); }

@media (max-width: 640px) {
  .sidebar { width: 60px; min-width: 60px; }
  .sidebar-brand span:not(.brand-icon) { display: none; }
  .nav-item span { display: none; }
  .btn-logout span { display: none; }
}
`;

// ─── app.js ─────────────────────────────────────────────────────────────────

const APP_JS = `
const PB = window.location.origin;

// ── HTTP utility ──────────────────────────────────────────────
async function pbFetch(path, opts = {}) {
  const token = Alpine.store('auth').token;
  const headers = { ...(opts.headers || {}) };
  if (token) headers['Authorization'] = 'Bearer ' + token;
  const isFormData = opts.body instanceof FormData;
  if (!isFormData && opts.body && typeof opts.body === 'object') {
    headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(opts.body);
  }
  const res = await fetch(PB + path, { ...opts, headers });
  let data = {};
  try { data = await res.json(); } catch {}
  if (!res.ok) {
    const err = new Error(data.message || ('HTTP ' + res.status));
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

// ── Stores ────────────────────────────────────────────────────
document.addEventListener('alpine:init', () => {

  Alpine.store('auth', {
    token: localStorage.getItem('ich_token') || null,
    get isLoggedIn() { return !!this.token; },
    async login(identity, password) {
      const d = await pbFetch('/api/collections/_superusers/auth-with-password', {
        method: 'POST', body: { identity, password }
      });
      this.token = d.token;
      localStorage.setItem('ich_token', d.token);
      await Alpine.store('schema').fetch();
    },
    logout() {
      this.token = null;
      localStorage.removeItem('ich_token');
      window.location.hash = '/login';
    }
  });

  Alpine.store('schema', {
    collections: [],
    async fetch() {
      if (!Alpine.store('auth').token) return;
      try {
        const d = await pbFetch('/api/collections?perPage=200');
        this.collections = (d.items || []).filter(c => !c.name.startsWith('_'));
      } catch(e) {
        if (e.status === 401) Alpine.store('auth').logout();
      }
    },
    get(name) { return this.collections.find(c => c.name === name); }
  });

  Alpine.store('router', {
    view: 'login',
    params: {},
    go(path) { window.location.hash = path; },
    parse(hash) {
      const path = (hash || '').replace(/^#\\/?/, '');
      const parts = path.split('/').filter(Boolean);
      if (!path || path === 'dashboard') {
        this.view = 'dashboard'; this.params = {};
      } else if (path === 'login') {
        this.view = 'login'; this.params = {};
      } else if (path === 'settings' || parts[0] === 'settings') {
        this.view = 'settings'; this.params = { tab: parts[1] || 'theme' };
      } else if (parts[0] === 'collection' && parts[1]) {
        const collection = parts[1], id = parts[2];
        this.view = id ? 'edit' : 'list';
        this.params = { collection, id: id === 'new' ? null : (id || null) };
      } else if (path === 'builder') {
        this.view = 'builder'; this.params = {};
      } else {
        this.view = 'dashboard'; this.params = {};
      }
    }
  });

  Alpine.store('i18n', {
    locale: localStorage.getItem('ich_locale') || 'en',
    msgs: {},
    async load(locale) {
      try {
        const r = await fetch('/admin/i18n/' + locale + '.json?v=' + Date.now());
        this.msgs = await r.json();
        this.locale = locale;
        localStorage.setItem('ich_locale', locale);
      } catch(e) { console.warn('i18n load failed', locale); }
    },
    t(key) { return this.msgs[key] || key; }
  });

  Alpine.store('theme', {
    tokens: {
      '--bg': '#0f0f11', '--surface': '#18181b', '--border': '#27272a',
      '--text': '#e4e4e7', '--muted': '#71717a', '--primary': '#a78bfa',
      '--accent': '#34d399', '--radius': '8px'
    },
    _defaults: null,
    init() {
      this._defaults = { ...this.tokens };
      try {
        const s = localStorage.getItem('ich_theme');
        if (s) this.tokens = JSON.parse(s);
      } catch {}
      this.apply();
    },
    apply() {
      for (const [k, v] of Object.entries(this.tokens))
        document.documentElement.style.setProperty(k, v);
    },
    save() { localStorage.setItem('ich_theme', JSON.stringify(this.tokens)); this.apply(); },
    reset() { this.tokens = { ...this._defaults }; localStorage.removeItem('ich_theme'); this.apply(); }
  });

});

// ── Main component ────────────────────────────────────────────
function app() {
  return {
    // login
    loginEmail: '', loginPassword: '', loginLoading: false, loginError: '',
    // dashboard
    counts: {},
    // list
    listRecords: [], listPage: 1, listTotalPages: 1, listSearch: '', listLoading: false,
    // edit
    editRecord: null, formData: {}, editLoading: false, editSaving: false, editErrors: {},
    editLocale: null,
    // settings
    settingsTab: 'theme',
    fieldsCollection: '',
    contentLocales: JSON.parse(localStorage.getItem('ich_content_locales') || '[]'),
    fieldConfig: JSON.parse(localStorage.getItem('ich_field_config') || '{}'),
    // toasts
    toasts: [],
    // builder
    builderName: '',
    builderFields: [],
    builderLoading: false,
    fieldTypes: [
      { id: 'text', label: 'Text', icon: 'T' },
      { id: 'number', label: 'Number', icon: '123' },
      { id: 'bool', label: 'Yes/No', icon: '☐' },
      { id: 'date', label: 'Date', icon: '📅' },
      { id: 'select', label: 'Select', icon: '▼' },
      { id: 'url', label: 'URL', icon: '🔗' },
      { id: 'file', label: 'File', icon: '📎' },
      { id: 'editor', label: 'Rich Text', icon: '📝' }
    ],

    get view() { return Alpine.store('router').view; },
    get routeParams() { return Alpine.store('router').params; },
    get editIsNew() { return !Alpine.store('router').params.id; },

    get listFields() {
      const col = Alpine.store('schema').get(Alpine.store('router').params.collection);
      if (!col) return [];
      return (col.fields || [])
        .filter(f => !['editor','file','json','relation'].includes(f.type) && f.type !== 'autodate')
        .slice(0, 4);
    },

    get editFields() {
      const col = Alpine.store('schema').get(Alpine.store('router').params.collection);
      if (!col) return [];
      return (col.fields || []).filter(f => f.type !== 'autodate' &&
        f.name !== 'collectionId' && f.name !== 'collectionName');
    },

    async init() {
      Alpine.store('theme').init();
      await Alpine.store('i18n').load(Alpine.store('i18n').locale);

      if (Alpine.store('auth').isLoggedIn) {
        await Alpine.store('schema').fetch();
      }

      window.addEventListener('hashchange', () => this._onHash());
      Alpine.store('router').parse(window.location.hash);
      await this._onHash();
    },

    async _onHash() {
      Alpine.store('router').parse(window.location.hash);
      const { view, params } = Alpine.store('router');
      if (!Alpine.store('auth').isLoggedIn) {
        if (view !== 'login') Alpine.store('router').go('/login');
        return;
      }
      if (view === 'login') { Alpine.store('router').go('/'); return; }
      if (view === 'dashboard') this._loadDashboard();
      else if (view === 'list') this._loadList();
      else if (view === 'edit') this._loadEdit();
      else if (view === 'builder') this._initBuilder();
    },

    go(path) { Alpine.store('router').go(path); },

    // ── Auth ──
    async login() {
      this.loginLoading = true; this.loginError = '';
      try {
        await Alpine.store('auth').login(this.loginEmail, this.loginPassword);
        this.go('/');
      } catch(e) {
        this.loginError = e.message || 'Login failed';
      } finally { this.loginLoading = false; }
    },

    // ── Dashboard ──
    async _loadDashboard() {
      this.counts = {};
      for (const col of Alpine.store('schema').collections) {
        try {
          const d = await pbFetch('/api/collections/' + col.name + '/records?perPage=1');
          this.counts = { ...this.counts, [col.name]: d.totalItems };
        } catch {}
      }
    },

    // ── List ──
    async _loadList() {
      const col = Alpine.store('router').params.collection;
      if (!col) return;
      this.listLoading = true; this.listRecords = []; this.listPage = 1;
      try {
        const schema = Alpine.store('schema').get(col);
        let filter = '';
        if (this.listSearch && schema) {
          const tf = (schema.fields || []).filter(f => f.type === 'text').slice(0, 2);
          if (tf.length) filter = '&filter=' + encodeURIComponent(tf.map(f => f.name + '~"' + this.listSearch + '"').join('||'));
        }
        const d = await pbFetch('/api/collections/' + col + '/records?page=' + this.listPage + '&perPage=20' + filter + '&sort=-created');
        this.listRecords = d.items || [];
        this.listTotalPages = d.totalPages || 1;
      } finally { this.listLoading = false; }
    },

    async listSearch_() { this.listPage = 1; this._loadList(); },

    async listPrev() { if (this.listPage > 1) { this.listPage--; this._loadListPage(); } },
    async listNext() { if (this.listPage < this.listTotalPages) { this.listPage++; this._loadListPage(); } },
    async _loadListPage() {
      const col = Alpine.store('router').params.collection;
      if (!col) return;
      this.listLoading = true;
      try {
        const d = await pbFetch('/api/collections/' + col + '/records?page=' + this.listPage + '&perPage=20&sort=-created');
        this.listRecords = d.items || [];
        this.listTotalPages = d.totalPages || 1;
      } finally { this.listLoading = false; }
    },

    async deleteRecord(id) {
      if (!confirm(Alpine.store('i18n').t('confirm.delete'))) return;
      const col = Alpine.store('router').params.collection;
      try {
        await pbFetch('/api/collections/' + col + '/records/' + id, { method: 'DELETE' });
        this.toast('Deleted', 'success');
        this._loadList();
      } catch(e) { this.toast(e.message, 'error'); }
    },

    // ── Edit ──
    async _loadEdit() {
      const { collection, id } = Alpine.store('router').params;
      if (!collection) return;
      this.editLoading = true; this.formData = {}; this.editErrors = {};
      this.editLocale = this.contentLocales[0] || null;

      const schema = Alpine.store('schema').get(collection);
      if (schema) {
        for (const f of (schema.fields || [])) {
          this.formData[f.name] = f.type === 'bool' ? false : (f.type === 'number' ? 0 : '');
        }
      }

      if (id) {
        try {
          const rec = await pbFetch('/api/collections/' + collection + '/records/' + id);
          this.editRecord = rec;
          Object.assign(this.formData, rec);
        } catch(e) { this.toast('Could not load record', 'error'); }
      } else {
        this.editRecord = null;
      }

      this.editLoading = false;

      // Populate contenteditable editors after DOM update
      setTimeout(() => {
        const schema = Alpine.store('schema').get(collection);
        if (!schema) return;
        for (const f of (schema.fields || [])) {
          if (f.type === 'editor') {
            const el = document.getElementById('editor-' + f.name);
            if (el) el.innerHTML = this.formData[f.name] || '';
          }
        }
      }, 50);
    },

    // ── Collection Builder ──
    _initBuilder() {
      this.builderName = '';
      this.builderFields = [];
      this.builderLoading = false;
    },

    addBuilderField(type) {
      const name = 'field_' + (this.builderFields.length + 1);
      this.builderFields.push({
        name: name,
        type: type,
        label: name.replace(/_/g, ' '),
        required: false,
        unique: false,
        options: type === 'select' ? ['Option 1', 'Option 2'] : null
      });
    },

    removeBuilderField(idx) {
      this.builderFields.splice(idx, 1);
    },

    moveBuilderField(idx, dir) {
      const newIdx = idx + dir;
      if (newIdx < 0 || newIdx >= this.builderFields.length) return;
      const tmp = this.builderFields[idx];
      this.builderFields[idx] = this.builderFields[newIdx];
      this.builderFields[newIdx] = tmp;
    },

    async createCollection() {
      if (!this.builderName.trim() || this.builderFields.length === 0) {
        this.toast('Enter a name and add at least one field', 'error');
        return;
      }
      
      this.builderLoading = true;
      
      try {
        // User-defined fields + automatic SEO fields
        const userSchema = this.builderFields.map(f => ({
          name: f.name.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
          type: f.type === 'select' ? 'text' : f.type,
          required: f.required,
          unique: f.unique
        }));
        
        const seoSchema = [
          { name: 'seo_title', type: 'text', required: false, unique: false },
          { name: 'seo_description', type: 'text', required: false, unique: false },
          { name: 'seo_keywords', type: 'text', required: false, unique: false },
          { name: 'canonical_url', type: 'text', required: false, unique: false },
          { name: 'og_image', type: 'file', required: false, unique: false },
          { name: 'no_index', type: 'bool', required: false, unique: false }
        ];
        
        await pbFetch('/api/collections', {
          method: 'POST',
          body: JSON.stringify({
            name: this.builderName.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_'),
            type: 'base',
            schema: [...userSchema, ...seoSchema],
            listRule: '',
            viewRule: '',
            createRule: null,
            updateRule: null,
            deleteRule: null
          })
        });
        
        await Alpine.store('schema').load();
        this.toast('Collection created!', 'success');
        this.go('/');
      } catch (e) {
        this.toast(e.message || 'Failed to create collection', 'error');
      } finally {
        this.builderLoading = false;
      }
    },

    async saveRecord() {
      const { collection, id } = Alpine.store('router').params;
      this.editSaving = true; this.editErrors = {};
      try {
        const schema = Alpine.store('schema').get(collection);
        const hasFile = (schema?.fields || []).some(f => f.type === 'file' && this.formData[f.name] instanceof File);
        const skip = new Set(['id','created','updated','collectionId','collectionName']);
        let body;
        if (hasFile) {
          body = new FormData();
          for (const [k, v] of Object.entries(this.formData)) {
            if (skip.has(k)) continue;
            if (v instanceof File) body.append(k, v);
            else if (v !== null && v !== undefined) body.append(k, String(v));
          }
        } else {
          body = {};
          for (const [k, v] of Object.entries(this.formData)) {
            if (!skip.has(k)) body[k] = v;
          }
        }
        const url = '/api/collections/' + collection + '/records' + (id ? '/' + id : '');
        await pbFetch(url, { method: id ? 'PATCH' : 'POST', body });
        this.toast(Alpine.store('i18n').t('action.save') + '!', 'success');
        this.go('/collection/' + collection);
      } catch(e) {
        this.editErrors = e.data?.data || {};
        this.toast(e.message || 'Save failed', 'error');
      } finally { this.editSaving = false; }
    },

    // ── Field helpers ──
    shouldShowField(field) {
      const col = Alpine.store('router').params.collection;
      if (this.isFieldHidden(col, field.name)) return false;
      if (this.contentLocales.length > 0 && this.editLocale) {
        const isLocaled = this.contentLocales.some(l => field.name.endsWith('_' + l));
        if (isLocaled) return field.name.endsWith('_' + this.editLocale);
      }
      return true;
    },
    fieldLabel(field) {
      const col = Alpine.store('router').params.collection;
      return this.getFieldLabel(col, field.name) || field.name.replace(/_/g, ' ');
    },
    formatCell(val, type) {
      if (val === null || val === undefined || val === '') return '—';
      if (type === 'bool') return val ? '✓' : '✗';
      if (type === 'date') return new Date(val).toLocaleDateString();
      const s = String(val);
      return s.length > 55 ? s.slice(0, 55) + '…' : s;
    },
    execCmd(cmd) { document.execCommand(cmd, false, null); },
    insertLink() {
      const url = prompt('URL:'); if (url) document.execCommand('createLink', false, url);
    },

    // ── Relation ──
    _relCache: {},
    async loadRelOptions(field) {
      if (!field.collectionId) return [];
      const cacheKey = field.collectionId;
      if (this._relCache[cacheKey]) return this._relCache[cacheKey];
      try {
        const cols = Alpine.store('schema').collections;
        const rel = cols.find(c => c.id === field.collectionId || c.name === field.collectionId);
        if (!rel) return [];
        const d = await pbFetch('/api/collections/' + rel.name + '/records?perPage=100');
        const items = (d.items || []).map(r => ({ id: r.id, label: r.title || r.name || r.slug || r.id }));
        this._relCache[cacheKey] = items;
        return items;
      } catch { return []; }
    },
    _relOptions: {},
    async initRelField(field) {
      this._relOptions = { ...this._relOptions, [field.name]: await this.loadRelOptions(field) };
    },

    // ── i18n ──
    async switchLocale(locale) {
      await Alpine.store('i18n').load(locale);
    },

    // ── Content locales ──
    saveContentLocales() {
      localStorage.setItem('ich_content_locales', JSON.stringify(this.contentLocales));
      this.toast('Saved', 'success');
    },

    // ── Field config ──
    getCollectionFields(name) { return Alpine.store('schema').get(name)?.fields || []; },
    isFieldHidden(col, name) { return (this.fieldConfig[col]?.hidden || []).includes(name); },
    getFieldLabel(col, name) { return this.fieldConfig[col]?.labels?.[name] || ''; },
    toggleField(col, name, hide) {
      if (!this.fieldConfig[col]) this.fieldConfig[col] = {};
      const h = this.fieldConfig[col].hidden = (this.fieldConfig[col].hidden || []);
      if (hide) { if (!h.includes(name)) h.push(name); }
      else this.fieldConfig[col].hidden = h.filter(n => n !== name);
    },
    setFieldLabel(col, name, label) {
      if (!this.fieldConfig[col]) this.fieldConfig[col] = {};
      if (!this.fieldConfig[col].labels) this.fieldConfig[col].labels = {};
      this.fieldConfig[col].labels[name] = label;
    },
    saveFieldConfig() {
      localStorage.setItem('ich_field_config', JSON.stringify(this.fieldConfig));
      this.toast('Field config saved', 'success');
    },

    // ── Toast ──
    toast(msg, type = 'info') {
      const id = Date.now() + Math.random();
      this.toasts = [...this.toasts, { id, message: msg, type }];
      setTimeout(() => { this.toasts = this.toasts.filter(t => t.id !== id); }, 3000);
    }
  };
}
`;

// ─── index.html ─────────────────────────────────────────────────────────────

const INDEX_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Ichabod Admin</title>
  <link rel="stylesheet" href="/admin/admin.css"/>
  <script src="/admin/app.js"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.14.1/dist/cdn.min.js"></script>
</head>
<body x-data="app()" x-init="init()" x-cloak>

  <!-- ── Login ── -->
  <div x-show="!$store.auth.isLoggedIn" class="login-wrap">
    <form @submit.prevent="login()" class="login-card">
      <div class="login-logo"><span>◆</span> Ichabod Admin</div>
      <div x-show="loginError" class="alert" x-text="loginError"></div>
      <div class="form-group">
        <label>Email</label>
        <input type="email" class="input" x-model="loginEmail" required autofocus/>
      </div>
      <div class="form-group">
        <label>Password</label>
        <input type="password" class="input" x-model="loginPassword" required/>
      </div>
      <button type="submit" class="btn btn-primary" :disabled="loginLoading">
        <span x-show="!loginLoading">Sign in</span>
        <span x-show="loginLoading">…</span>
      </button>
    </form>
  </div>

  <!-- ── App shell ── -->
  <div x-show="$store.auth.isLoggedIn" class="app">

    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-brand">
        <span class="brand-icon">◆</span>
        <div>
          <div>Ichabod</div>
          <div class="brand-sub">Admin</div>
        </div>
      </div>

      <nav class="sidebar-nav">
        <div class="nav-section" x-text="$store.i18n.t('nav.collections')">Collections</div>
        <template x-for="col in $store.schema.collections" :key="col.name">
          <a class="nav-item"
             :class="{ active: view === 'list' && routeParams.collection === col.name }"
             @click.prevent="go('/collection/' + col.name)"
             href="#" x-text="col.name"></a>
        </template>
      </nav>

      <div class="sidebar-footer">
        <a class="nav-item"
           :class="{ active: view === 'settings' }"
           @click.prevent="go('/settings')" href="#">
          ⚙&nbsp;<span x-text="$store.i18n.t('nav.settings')">Settings</span>
        </a>
        <button class="btn-logout" @click="$store.auth.logout()">
          ⏻&nbsp;<span x-text="$store.i18n.t('nav.logout')">Logout</span>
        </button>
        <div class="locale-select">
          <select @change="switchLocale($event.target.value)"
                  :value="$store.i18n.locale">
            <option value="en">EN</option>
            <option value="fr">FR</option>
            <option value="es">ES</option>
          </select>
        </div>
      </div>
    </aside>

    <!-- ── Main content ── -->
    <div class="content">

      <!-- Dashboard -->
      <div x-show="view === 'dashboard'">
        <div class="page-header">
          <h1 x-text="$store.i18n.t('page.dashboard')">Dashboard</h1>
          <button class="btn btn-primary" @click="go('builder')">
            + New Collection
          </button>
        </div>
        <div class="collection-grid">
          <template x-for="col in $store.schema.collections" :key="col.name">
            <div class="collection-card" @click="go('/collection/' + col.name)">
              <div class="collection-icon">⚡</div>
              <h3 x-text="col.name"></h3>
              <div class="collection-count">
                <span x-text="counts[col.name] ?? '…'"></span>
                &nbsp;<span x-text="$store.i18n.t('label.records')">records</span>
              </div>
            </div>
          </template>
        </div>
      </div>

      <!-- Collection Builder -->
      <div x-show="view === 'builder'">
        <div class="page-header">
          <h1>Create New Collection</h1>
        </div>
        <form @submit.prevent="createCollection()" class="builder-form">
          <div class="form-group">
            <label>Collection Name</label>
            <input type="text" x-model="builderName" 
                   placeholder="e.g., projects, testimonials, services"
                   :disabled="builderLoading" />
            <small>Lowercase, no spaces. Will be used as the API endpoint.</small>
          </div>

          <h3>Fields</h3>
          <p class="seo-note">🔍 SEO fields (seo_title, seo_description, keywords, og_image, etc.) are automatically included.</p>
          <div class="field-types">
            <template x-for="ft in fieldTypes" :key="ft.id">
              <button type="button" class="field-type-btn" @click="addBuilderField(ft.id)">
                <span x-text="ft.icon"></span>
                <span x-text="ft.label"></span>
              </button>
            </template>
          </div>

          <div class="builder-fields">
            <div x-show="builderFields.length === 0" class="empty">
              Click a field type above to add fields
            </div>
            <template x-for="(f, idx) in builderFields" :key="idx">
              <div class="builder-field-row">
                <input type="text" x-model="f.name" placeholder="field_name" />
                <select x-model="f.type">
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="bool">Yes/No</option>
                  <option value="date">Date</option>
                  <option value="select">Select</option>
                  <option value="url">URL</option>
                  <option value="file">File</option>
                  <option value="editor">Rich Text</option>
                </select>
                <label><input type="checkbox" x-model="f.required" /> Required</label>
                <label><input type="checkbox" x-model="f.unique" /> Unique</label>
                <button type="button" class="btn btn-sm" @click="moveBuilderField(idx, -1)" :disabled="idx === 0">↑</button>
                <button type="button" class="btn btn-sm" @click="moveBuilderField(idx, 1)" :disabled="idx === builderFields.length - 1">↓</button>
                <button type="button" class="btn btn-sm btn-danger" @click="removeBuilderField(idx)">×</button>
              </div>
            </template>
          </div>

          <div class="form-actions">
            <button type="button" class="btn" @click="go('/')" :disabled="builderLoading">Cancel</button>
            <button type="submit" class="btn btn-primary" :disabled="builderLoading || !builderName.trim() || builderFields.length === 0">
              <span x-show="builderLoading">Creating…</span>
              <span x-show="!builderLoading">Create Collection</span>
            </button>
          </div>
        </form>
      </div>

      <!-- List view -->
      <div x-show="view === 'list'">
        <div class="page-header">
          <h1 x-text="routeParams.collection"></h1>
          <button class="btn btn-primary"
                  @click="go('/collection/' + routeParams.collection + '/new')"
                  x-text="$store.i18n.t('action.new')">+ New</button>
        </div>
        <div class="toolbar">
          <input type="search" class="search-input"
                 x-model="listSearch"
                 @input.debounce.350ms="listSearch_()"
                 :placeholder="$store.i18n.t('action.search')"/>
        </div>
        <div x-show="listLoading" class="loading" x-text="$store.i18n.t('label.loading')">Loading…</div>
        <div x-show="!listLoading" class="table-wrap">
          <div x-show="!listRecords.length" class="empty" x-text="$store.i18n.t('label.empty')">No records.</div>
          <table x-show="listRecords.length" class="table">
            <thead>
              <tr>
                <template x-for="f in listFields" :key="f.name">
                  <th x-text="f.name"></th>
                </template>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <template x-for="rec in listRecords" :key="rec.id">
                <tr>
                  <template x-for="f in listFields" :key="f.name">
                    <td x-text="formatCell(rec[f.name], f.type)"></td>
                  </template>
                  <td class="row-actions">
                    <button class="btn btn-sm"
                            @click="go('/collection/' + routeParams.collection + '/' + rec.id)"
                            x-text="$store.i18n.t('action.edit')">Edit</button>
                    <button class="btn btn-sm btn-danger"
                            @click="deleteRecord(rec.id)"
                            x-text="$store.i18n.t('action.delete')">Delete</button>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
          <div class="pagination" x-show="listTotalPages > 1">
            <button class="btn btn-sm" @click="listPrev()" :disabled="listPage <= 1">←</button>
            <span>
              <span x-text="$store.i18n.t('label.page')">Page</span>
              <span x-text="listPage"></span>
              <span x-text="$store.i18n.t('label.of')">of</span>
              <span x-text="listTotalPages"></span>
            </span>
            <button class="btn btn-sm" @click="listNext()" :disabled="listPage >= listTotalPages">→</button>
          </div>
        </div>
      </div>

      <!-- Edit / Create -->
      <div x-show="view === 'edit'">
        <div class="page-header">
          <div class="breadcrumb">
            <a @click.prevent="go('/collection/' + routeParams.collection)" href="#"
               x-text="routeParams.collection"></a>
            <span>/</span>
            <span x-text="editIsNew ? $store.i18n.t('action.new') : $store.i18n.t('action.edit')"></span>
          </div>
        </div>

        <div x-show="editLoading" class="loading" x-text="$store.i18n.t('label.loading')">Loading…</div>

        <form x-show="!editLoading" @submit.prevent="saveRecord()" class="edit-form">

          <!-- Content locale tabs -->
          <div x-show="contentLocales.length > 1" class="locale-tabs">
            <template x-for="loc in contentLocales" :key="loc">
              <button type="button"
                      :class="{ active: editLocale === loc }"
                      @click="editLocale = loc"
                      x-text="loc.toUpperCase()"></button>
            </template>
          </div>

          <template x-for="field in editFields" :key="field.name">
            <div class="form-group" x-show="shouldShowField(field)">
              <label :for="'f-' + field.name">
                <span x-text="fieldLabel(field)"></span>
                <span x-show="field.required" class="required">*</span>
              </label>

              <!-- text / email / url -->
              <template x-if="field.type === 'text' || field.type === 'email' || field.type === 'url'">
                <input :type="field.type === 'email' ? 'email' : field.type === 'url' ? 'url' : 'text'"
                       class="input" :id="'f-' + field.name" x-model="formData[field.name]"/>
              </template>

              <!-- number -->
              <template x-if="field.type === 'number'">
                <input type="number" class="input" :id="'f-' + field.name" x-model.number="formData[field.name]"/>
              </template>

              <!-- date -->
              <template x-if="field.type === 'date'">
                <input type="datetime-local" class="input" :id="'f-' + field.name" x-model="formData[field.name]"/>
              </template>

              <!-- bool -->
              <template x-if="field.type === 'bool'">
                <label class="toggle">
                  <input type="checkbox" x-model="formData[field.name]"/>
                  <span class="toggle-slider"></span>
                </label>
              </template>

              <!-- select -->
              <template x-if="field.type === 'select'">
                <select class="input" :id="'f-' + field.name" x-model="formData[field.name]">
                  <option value=""></option>
                  <template x-for="opt in (field.values || [])" :key="opt">
                    <option :value="opt" x-text="opt"></option>
                  </template>
                </select>
              </template>

              <!-- editor -->
              <template x-if="field.type === 'editor'">
                <div class="editor-wrap">
                  <div class="editor-toolbar">
                    <button type="button" @click="execCmd('bold')"><b>B</b></button>
                    <button type="button" @click="execCmd('italic')"><i>I</i></button>
                    <button type="button" @click="execCmd('underline')"><u>U</u></button>
                    <button type="button" @click="insertLink()">🔗</button>
                    <button type="button" @click="execCmd('insertUnorderedList')">•</button>
                    <button type="button" @click="execCmd('insertOrderedList')">1.</button>
                  </div>
                  <div class="editor-content" contenteditable="true"
                       :id="'editor-' + field.name"
                       @blur="formData[field.name] = $event.target.innerHTML"
                       @input="formData[field.name] = $event.target.innerHTML"></div>
                </div>
              </template>

              <!-- file -->
              <template x-if="field.type === 'file'">
                <div class="file-wrap">
                  <div x-show="formData[field.name] && typeof formData[field.name] === 'string'" class="current-file">
                    Current: <span x-text="formData[field.name]"></span>
                  </div>
                  <input type="file" class="input" :id="'f-' + field.name"
                         @change="formData[field.name] = $event.target.files[0]"/>
                </div>
              </template>

              <!-- json -->
              <template x-if="field.type === 'json'">
                <textarea class="input textarea" :id="'f-' + field.name"
                          x-model="formData[field.name]" rows="5"></textarea>
              </template>

              <!-- relation -->
              <template x-if="field.type === 'relation'">
                <div x-init="initRelField(field)">
                  <select class="input" :id="'f-' + field.name" x-model="formData[field.name]">
                    <option value=""></option>
                    <template x-for="opt in (_relOptions[field.name] || [])" :key="opt.id">
                      <option :value="opt.id" x-text="opt.label"></option>
                    </template>
                  </select>
                </div>
              </template>

              <div x-show="editErrors[field.name]" class="field-error"
                   x-text="editErrors[field.name]?.message || editErrors[field.name]"></div>
            </div>
          </template>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary" :disabled="editSaving">
              <span x-show="!editSaving" x-text="$store.i18n.t('action.save')">Save</span>
              <span x-show="editSaving">Saving…</span>
            </button>
            <button type="button" class="btn"
                    @click="go('/collection/' + routeParams.collection)"
                    x-text="$store.i18n.t('action.cancel')">Cancel</button>
          </div>
        </form>
      </div>

      <!-- Settings -->
      <div x-show="view === 'settings'">
        <div class="page-header">
          <h1 x-text="$store.i18n.t('page.settings')">Settings</h1>
        </div>

        <div class="settings-tabs">
          <button :class="{ active: settingsTab === 'theme' }" @click="settingsTab = 'theme'"
                  x-text="$store.i18n.t('settings.theme')">Theme</button>
          <button :class="{ active: settingsTab === 'i18n' }" @click="settingsTab = 'i18n'"
                  x-text="$store.i18n.t('settings.i18n')">i18n</button>
          <button :class="{ active: settingsTab === 'fields' }" @click="settingsTab = 'fields'"
                  x-text="$store.i18n.t('settings.fields')">Fields</button>
        </div>

        <!-- Theme tab -->
        <div x-show="settingsTab === 'theme'" class="settings-section">
          <template x-for="entry in Object.entries($store.theme.tokens)" :key="entry[0]">
            <div class="form-group theme-row">
              <label x-text="entry[0].replace('--','')"></label>
              <div class="theme-input-row">
                <input x-show="entry[1].startsWith('#')" type="color"
                       :value="entry[1]"
                       @input="$store.theme.tokens[entry[0]] = $event.target.value; $store.theme.apply()"/>
                <input type="text" class="input input-sm"
                       :value="entry[1]"
                       @change="$store.theme.tokens[entry[0]] = $event.target.value; $store.theme.apply()"/>
              </div>
            </div>
          </template>
          <div class="form-actions">
            <button class="btn btn-primary" @click="$store.theme.save()"
                    x-text="$store.i18n.t('action.save')">Save theme</button>
            <button class="btn" @click="$store.theme.reset()"
                    x-text="$store.i18n.t('action.reset')">Reset</button>
          </div>
        </div>

        <!-- i18n tab -->
        <div x-show="settingsTab === 'i18n'" class="settings-section">
          <div class="form-group">
            <label x-text="$store.i18n.t('settings.ui_lang')">UI Language</label>
            <select class="input" :value="$store.i18n.locale" @change="switchLocale($event.target.value)">
              <option value="en">English</option>
              <option value="fr">Français</option>
              <option value="es">Español</option>
            </select>
          </div>
          <div class="form-group">
            <label x-text="$store.i18n.t('settings.content_locales')">Content locales</label>
            <p class="hint">Fields named <code>title_en</code>, <code>title_fr</code> will appear as language tabs in the editor.</p>
            <div class="locale-list">
              <template x-for="(loc, idx) in contentLocales" :key="idx">
                <div class="locale-row">
                  <input type="text" class="input input-sm" x-model="contentLocales[idx]" placeholder="en"/>
                  <button type="button" class="btn btn-sm btn-danger" @click="contentLocales.splice(idx, 1)">✕</button>
                </div>
              </template>
              <button type="button" class="btn btn-sm" @click="contentLocales.push('')">+ Add locale</button>
            </div>
            <button class="btn btn-primary" @click="saveContentLocales()"
                    x-text="$store.i18n.t('action.save')">Save</button>
          </div>
        </div>

        <!-- Fields tab -->
        <div x-show="settingsTab === 'fields'" class="settings-section">
          <div class="form-group">
            <label>Collection</label>
            <select class="input" x-model="fieldsCollection">
              <option value="">Select…</option>
              <template x-for="col in $store.schema.collections" :key="col.name">
                <option :value="col.name" x-text="col.name"></option>
              </template>
            </select>
          </div>
          <div x-show="fieldsCollection">
            <template x-for="field in getCollectionFields(fieldsCollection)" :key="field.name">
              <div class="field-config-row">
                <span class="field-name" x-text="field.name"></span>
                <label>
                  <input type="checkbox"
                         :checked="!isFieldHidden(fieldsCollection, field.name)"
                         @change="toggleField(fieldsCollection, field.name, !$event.target.checked)"/>
                  Visible
                </label>
                <label>Label
                  <input type="text" class="input input-sm"
                         :placeholder="field.name"
                         :value="getFieldLabel(fieldsCollection, field.name)"
                         @change="setFieldLabel(fieldsCollection, field.name, $event.target.value)"/>
                </label>
              </div>
            </template>
            <div class="form-actions" style="margin-top:.75rem">
              <button class="btn btn-primary" @click="saveFieldConfig()"
                      x-text="$store.i18n.t('action.save')">Save</button>
            </div>
          </div>
        </div>
      </div>

    </div><!-- /content -->
  </div><!-- /app -->

  <!-- Toasts -->
  <div class="toast-container" aria-live="polite">
    <template x-for="t in toasts" :key="t.id">
      <div class="toast" :class="'toast-' + t.type" x-text="t.message" x-transition></div>
    </template>
  </div>

</body>
</html>
`;

// ─── scaffoldAdmin ───────────────────────────────────────────────────────────

function write(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
}

export function scaffoldAdmin(pbPublicDir, pbPort = 8090) {
  const adminDir = path.join(pbPublicDir, 'admin');

  write(path.join(adminDir, 'index.html'), INDEX_HTML);
  write(path.join(adminDir, 'admin.css'),  ADMIN_CSS);
  write(path.join(adminDir, 'app.js'),     APP_JS);
  write(path.join(adminDir, 'i18n', 'en.json'), JSON.stringify(EN, null, 2));
  write(path.join(adminDir, 'i18n', 'fr.json'), JSON.stringify(FR, null, 2));
  write(path.join(adminDir, 'i18n', 'es.json'), JSON.stringify(ES, null, 2));

  log('ok', 'Admin UI scaffolded → pb/pb_public/admin/');
}
