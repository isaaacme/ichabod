
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
      const path = (hash || '').replace(/^#\/?/, '');
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
