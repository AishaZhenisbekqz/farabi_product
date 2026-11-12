/* Client-side data layer. Emulates backend (API + DB) with localStorage.
   In production these calls are replaced by REST API requests. */

const DB_KEY = 'fp_db_v1';

const SECTIONS = {
  products: { num: '01', brand: 'FARABI PRODUCTS', icon: 'box', color: 'products', nav: 'nav_products', title: 'sec_products', desc: 'sec_products_d' },
  ai: { num: '02', brand: 'FARABI AI & TECH', icon: 'cpu', color: 'ai', nav: 'nav_ai', title: 'sec_ai', desc: 'sec_ai_d' },
  patents: { num: '03', brand: 'FARABI IP', icon: 'award', color: 'ip', nav: 'nav_patents', title: 'sec_patents', desc: 'sec_patents_d' },
  books: { num: '04', brand: 'FARABI BOOKS', icon: 'bookOpen', color: 'books', nav: 'nav_books', title: 'sec_books', desc: 'sec_books_d' }
};

function localISO(d = new Date()) {
  const p = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

const Store = {
  db: null,

  load() {
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(DB_KEY) || 'null'); } catch (e) { saved = null; }
    this.db = saved || JSON.parse(JSON.stringify(SEED));
  },
  save() {
    try { localStorage.setItem(DB_KEY, JSON.stringify(this.db)); } catch (e) { console.warn('Storage unavailable', e); }
  },
  reset() {
    this.db = JSON.parse(JSON.stringify(SEED));
    this.save();
  },

  /* lookups */
  faculty(id) { return this.db.faculties.find(f => f.id === id); },
  lab(id) { return this.db.labs.find(l => l.id === id); },
  scientist(id) { return this.db.scientists.find(s => s.id === id); },
  contact(id) { return this.db.contacts.find(c => c.id === id); },
  list(type, all = false) { return (this.db[type] || []).filter(x => all || x.published); },
  get(type, id) { return (this.db[type] || []).find(x => x.id === id); },

  /* unified search index */
  allItems() {
    return Object.keys(SECTIONS).flatMap(type => this.list(type).map(it => ({ ...it, _type: type })));
  },
  people(it) { return it.authors || (it.scientist ? [it.scientist] : []); },
  haystack(it) {
    const parts = [L(it.title), L(it.short), L(it.desc), it.number, it.isbn, it.annotation, it.application, it.problem, it.science,
      (it.keywords || []).join(' '), (it.features || []).join(' '), (it.team || []).join(' '),
      L((this.faculty(it.faculty) || {}).name), L((this.lab(it.lab) || {}).name)];
    this.people(it).forEach(id => { const s = this.scientist(id); if (s) parts.push(s.name.ru, s.name.kz, s.name.en); });
    ['ru', 'kz', 'en'].forEach(l => { if (it.title && it.title[l]) parts.push(it.title[l]); });
    return parts.filter(Boolean).join(' ').toLowerCase();
  },
  search(q, items) {
    q = (q || '').trim().toLowerCase();
    items = items || this.allItems();
    if (!q) return items;
    const terms = q.split(/\s+/);
    return items.filter(it => { const h = this.haystack(it); return terms.every(t => h.includes(t)); });
  },

  /* capabilities used by filters */
  caps(it) {
    const t = it._type;
    return {
      patent: t === 'patents' || (it.patents && it.patents.length > 0) || it.patent === true,
      cert: !!it.hasCert || (it.certificates && it.certificates.length > 0),
      buy: (it.marketplaces && it.marketplaces.length > 0) || !!(it.links && it.links.buy) || !!it.buyUrl,
      license: t === 'patents' ? ['license', 'transfer'].includes(it.status) : t === 'ai',
      implement: t === 'ai' || (t === 'products' && it.stage >= 6) || (t === 'patents' && !['na', 'dev'].includes(it.status))
    };
  },
  year(it) { return it.year || (it.regDate || it.date || '').slice(0, 4); },
  commercial(it) {
    if (it._type === 'patents') return !['na', 'dev', 'commercialized'].includes(it.status);
    if (it._type === 'products') return it.stage >= 5;
    if (it._type === 'ai') return it.trl >= 6;
    return false;
  },

  /* analytics */
  trackView(type, id) {
    const it = this.get(type, id); if (!it) return;
    it.views = (it.views || 0) + 1; this.save();
  },
  trackClick(type, id, mp) {
    const it = this.get(type, id);
    if (it) it.clicks = (it.clicks || 0) + 1;
    this.db.stats.mpClicks[mp] = (this.db.stats.mpClicks[mp] || 0) + 1;
    this.save();
  },

  /* requests */
  nextRequestId() {
    const y = new Date().getFullYear();
    const nums = this.db.requests.map(r => parseInt(r.id.split('-')[2], 10) || 0);
    const n = (nums.length ? Math.max(...nums) : 0) + 1;
    return `FP-${y}-${String(n).padStart(4, '0')}`;
  },
  addRequest(data) {
    const r = { id: this.nextRequestId(), created: localISO(), status: 'new', ...data };
    this.db.requests.unshift(r);
    this.log('request', `Новая заявка ${r.id}`, 'Посетитель');
    this.save();
    return r;
  },

  /* audit log */
  log(action, text, who) {
    this.db.log = this.db.log || [];
    this.db.log.unshift({ at: localISO(), action, text, who: who || (Admin.user ? Admin.user.label : '—') });
    this.db.log = this.db.log.slice(0, 300);
  }
};

Store.load();
