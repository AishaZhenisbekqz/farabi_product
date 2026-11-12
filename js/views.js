/* Page views */

const Views = {};

/* ========== HOME ========== */
Views.home = function () {
  const db = Store.db;
  const products = Store.list('products'), ai = Store.list('ai'), patents = Store.list('patents'), books = Store.list('books');
  const byDate = arr => [...arr].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  const all = Store.allItems();
  const newest = byDate(all.filter(x => x._type !== 'books')).slice(0, 8);
  const popular = [...products].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 8);
  const commercial = all.filter(x => Store.commercial(x)).sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 8);
  const forBiz = [...ai.map(x => ({ ...x, _type: 'ai' })), ...patents.filter(p => ['license', 'transfer', 'coprod'].includes(p.status)).map(x => ({ ...x, _type: 'patents' }))].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 8);
  const counts = { products: products.length, ai: ai.length, patents: patents.length, books: books.length };
  const quick = ['НаноҚұқырт', 'MedVision', 'наносера', 'биостимулятор', 'QazSpeech'];

  setMeta({ ld: { '@context': 'https://schema.org', '@type': 'WebSite', name: 'FARABI PRODUCT', url: location.origin, potentialAction: { '@type': 'SearchAction', target: location.origin + '/#/search?q={q}', 'query-input': 'required name=q' } } });

  return `
  <section class="hero">
    <div class="hero__bg" aria-hidden="true"><span class="orb orb--1"></span><span class="orb orb--2"></span><span class="orb orb--3"></span><div class="hero__grid"></div></div>
    <div class="container hero__inner">
      <div class="hero__eyebrow"><span class="pulse"></span> ${T('tagline')}</div>
      <h1 class="hero__title">FARABI <span class="grad">PRODUCT</span></h1>
      <p class="hero__lead">${T('heroTitle')}</p>
      <form class="hero-search" data-search>
        ${icon('search', 22)}
        <input name="q" type="search" placeholder="${esc(T('searchPh'))}" autocomplete="off" aria-label="${esc(T('search'))}">
        <button class="btn btn--primary" type="submit">${T('search')}</button>
      </form>
      <div class="hero__quick"><span>${T('popularQ')}</span>${quick.map(q => `<a href="#/search?q=${encodeURIComponent(q)}">${esc(q)}</a>`).join('')}</div>
      <div class="hero__stats">
        ${Object.keys(SECTIONS).map(k => `<a href="#/${k}" class="hstat hstat--${SECTIONS[k].color}"><b data-count="${counts[k]}">${counts[k]}</b><span>${T('stat_' + k)}</span></a>`).join('')}
      </div>
    </div>
  </section>

  <section class="container blocks">
    ${Object.entries(SECTIONS).map(([k, s]) => `
      <a class="block block--${s.color}" href="#/${k}">
        <span class="block__num">${s.num}</span>
        <span class="block__icon">${icon(s.icon, 28)}</span>
        <span class="block__brand">${esc(s.brand)}</span>
        <h2 class="block__title">${T(s.title)}</h2>
        <p class="block__desc">${T(s.desc)}</p>
        <span class="block__foot"><span>${counts[k]} ${T('items')}</span><span class="block__arrow">${icon('arrow', 20)}</span></span>
      </a>`).join('')}
  </section>

  ${rail(T('h_popular'), popular, 'products', '#/products')}
  ${rail(T('h_new'), newest, null, '#/search')}
  ${rail(T('h_ai'), ai, 'ai', '#/ai')}

  <section class="container questions">
    ${[['q1', 'grid'], ['q2', 'cart'], ['q3', 'user']].map(([k, ic], i) => `<div class="question"><span class="question__n">0${i + 1}</span>${icon(ic, 26)}<h3>${T(k)}</h3><p>${T(k + 'd')}</p></div>`).join('')}
  </section>

  ${rail(T('h_business'), forBiz, null, '#/business')}
  ${rail(T('h_patents'), byDate(patents).slice(0, 8), 'patents', '#/patents')}
  ${rail(T('h_books'), byDate(books), 'books', '#/books')}
  ${rail(T('h_commercial'), commercial, null, '#/search?commercial=1')}

  <section class="container">
    <div class="cta">
      <div class="cta__bg" aria-hidden="true"></div>
      <div class="cta__text"><h2>${T('ctaTitle')}</h2><p>${T('ctaSub')}</p></div>
      <div class="cta__btns">
        <button class="btn btn--light btn--lg" data-request='{"kind":"partner"}'>${icon('handshake', 20)} ${T('proposeCoop')}</button>
        <a class="btn btn--ghost-light btn--lg" href="#/business">${icon('building', 20)} ${T('becomePartner')}</a>
      </div>
    </div>
  </section>`;
};

function rail(title, items, type, more) {
  if (!items.length) return '';
  return `<section class="container rail">
    <div class="rail__head"><h2 class="h2">${esc(title)}</h2>
      <div class="rail__ctrl"><a class="link" href="${more}">${T('viewAll')} ${icon('arrow', 16)}</a>
      <button class="icon-btn icon-btn--soft" data-rail="-1" aria-label="prev">${icon('arrowLeft', 18)}</button><button class="icon-btn icon-btn--soft" data-rail="1" aria-label="next">${icon('arrow', 18)}</button></div></div>
    <div class="rail__track">${items.map(it => card(it, type || it._type)).join('')}</div>
  </section>`;
}

/* ========== CATALOG ========== */
const FILTER_DEFS = {
  products: { chip: ['category', 'productCategories'], fields: ['faculty', 'lab', 'author', 'stage'], opts: ['patent', 'cert', 'buy', 'implement'] },
  ai: { chip: ['industry', 'industries'], fields: ['faculty', 'lab', 'author', 'year'], opts: ['patent', 'buy', 'license', 'implement'] },
  patents: { chip: ['status', 'patentStatus'], fields: ['kind', 'faculty', 'lab', 'author', 'year'], opts: ['license', 'implement'] },
  books: { chip: ['kind', 'bookKinds'], fields: ['faculty', 'author', 'year'], opts: ['buy'] },
  all: { chip: ['_type', null], fields: ['faculty', 'lab', 'author', 'year', 'industry', 'status'], opts: ['patent', 'cert', 'buy', 'license', 'implement'] }
};

let CatalogState = null;

Views.catalog = function (type, query) {
  const sec = SECTIONS[type];
  const def = FILTER_DEFS[type];
  CatalogState = { type, q: query.q || '', chip: query[def.chip[0]] || query.cat || '', f: {}, opts: new Set(), sort: 'new' };
  def.fields.forEach(k => { if (query[k]) CatalogState.f[k] = query[k]; });
  const items = Store.list(type).map(x => ({ ...x, _type: type }));
  setMeta({ title: T(sec.title), description: T(sec.desc), keywords: Object.values(ENUMS[def.chip[1]] || {}).map(L).join(', ') });

  const chips = Object.entries(ENUMS[def.chip[1]]).filter(([k]) => items.some(i => i[def.chip[0]] === k));
  return `
  <section class="page-hero page-hero--${sec.color}">
    <div class="container">
      <nav class="crumbs"><a href="#/">${T('nav_home')}</a><span>/</span><b>${T(sec.nav)}</b></nav>
      <div class="page-hero__row">
        <div><span class="page-hero__brand">${icon(sec.icon, 18)} ${sec.num} · ${esc(sec.brand)}</span><h1 class="h1">${T(sec.title)}</h1><p class="page-hero__desc">${T(sec.desc)}</p></div>
        <form class="search-inline" data-catalog-search>${icon('search', 20)}<input name="q" type="search" value="${esc(CatalogState.q)}" placeholder="${esc(T('searchPh'))}"></form>
      </div>
      <div class="chips" data-chips>
        <button class="chip ${!CatalogState.chip ? 'active' : ''}" data-chip="">${T('all')} <small>${items.length}</small></button>
        ${chips.map(([k, v]) => `<button class="chip ${CatalogState.chip === k ? 'active' : ''}" data-chip="${k}">${esc(L(v))} <small>${items.filter(i => i[def.chip[0]] === k).length}</small></button>`).join('')}
      </div>
    </div>
  </section>
  <section class="container catalog">
    <aside class="filters" id="filters">${filtersPanel(type, items)}</aside>
    <div class="catalog__main">
      <div class="catalog__bar">
        <button class="btn btn--soft filters-toggle" data-filters-open>${icon('filter', 18)} ${T('filters')}</button>
        <span class="catalog__count" id="resultCount"></span>
        <label class="sort">${T('sort')}: <select data-sort><option value="new">${T('sort_new')}</option><option value="pop">${T('sort_pop')}</option><option value="az">${T('sort_az')}</option></select></label>
      </div>
      <div class="grid" id="grid"></div>
    </div>
  </section>`;
};

function filterOptions(key, items) {
  const uniq = (arr) => [...new Set(arr.filter(v => v !== '' && v != null))];
  switch (key) {
    case 'faculty': return uniq(items.map(i => i.faculty)).map(id => [id, L((Store.faculty(id) || {}).name)]);
    case 'lab': return uniq(items.map(i => i.lab)).map(id => [id, L((Store.lab(id) || {}).name)]);
    case 'author': return uniq(items.flatMap(i => Store.people(i))).map(id => [id, L((Store.scientist(id) || {}).name)]);
    case 'year': return uniq(items.map(i => Store.year(i))).sort().reverse().map(y => [y, y]);
    case 'stage': return ENUMS.stages.map((s, i) => [String(i), L(s)]).filter(([i]) => items.some(it => String(it.stage) === i));
    case 'kind': return uniq(items.map(i => i.kind)).map(k => [k, L((ENUMS.patentKinds[k] || ENUMS.bookKinds[k]))]);
    case 'industry': return uniq(items.map(i => i.industry)).map(k => [k, L(ENUMS.industries[k])]);
    case 'status': return uniq(items.map(i => i.status)).map(k => [k, L(ENUMS.patentStatus[k])]);
  }
  return [];
}
const FIELD_LABEL = { faculty: 'f_faculty', lab: 'f_lab', author: 'f_author', year: 'f_year', stage: 'f_stage', kind: 'f_kind', industry: 'f_industry', status: 'f_status' };

function filtersPanel(type, items) {
  const def = FILTER_DEFS[type];
  return `<div class="filters__head"><h3>${icon('filter', 18)} ${T('filters')}</h3><button class="link" data-filters-reset>${T('reset')}</button><button class="icon-btn filters__close" data-filters-close aria-label="close">${icon('x', 20)}</button></div>
    ${def.fields.map(k => {
      const opts = filterOptions(k, items);
      if (!opts.length) return '';
      return `<label class="field"><span>${T(FIELD_LABEL[k])}</span><select data-filter="${k}"><option value="">${T('all')}</option>${opts.map(([v, l]) => `<option value="${esc(v)}" ${CatalogState.f[k] === v ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select></label>`;
    }).join('')}
    <div class="field"><span>${T('f_opts')}</span>${def.opts.map(o => `<label class="check"><input type="checkbox" data-opt="${o}"><span>${T('o_' + o)}</span></label>`).join('')}</div>
    <button class="btn btn--primary btn--block filters__apply" data-filters-close>${T('apply')}</button>`;
}

function applyFilters(items, st, def) {
  let res = Store.search(st.q, items);
  if (st.chip) res = res.filter(i => (def.chip[0] === '_type' ? i._type : i[def.chip[0]]) === st.chip);
  Object.entries(st.f).forEach(([k, v]) => {
    if (!v) return;
    res = res.filter(i => {
      if (k === 'author') return Store.people(i).includes(v);
      if (k === 'year') return Store.year(i) === v;
      if (k === 'stage') return String(i.stage) === v;
      return i[k] === v;
    });
  });
  st.opts.forEach(o => { res = res.filter(i => Store.caps(i)[o]); });
  if (st.commercial) res = res.filter(i => Store.commercial(i));
  if (st.sort === 'pop') res.sort((a, b) => (b.views || 0) - (a.views || 0));
  else if (st.sort === 'az') res.sort((a, b) => L(a.title).localeCompare(L(b.title)));
  else res.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  return res;
}

function renderGrid() {
  const st = CatalogState; if (!st) return;
  const def = FILTER_DEFS[st.type];
  const items = st.type === 'all' ? Store.allItems() : Store.list(st.type).map(x => ({ ...x, _type: st.type }));
  const res = applyFilters(items, st, def);
  $('#resultCount').innerHTML = `${T('found')}: <b>${res.length}</b>`;
  $('#grid').innerHTML = res.length ? res.map(it => card(it, it._type)).join('') : `<div class="empty">${icon('search', 40)}<h3>${T('nothing')}</h3><p>${T('nothingD')}</p><button class="btn btn--soft" data-filters-reset>${T('reset')}</button></div>`;
}

/* ========== SEARCH (unified) ========== */
Views.search = function (query) {
  CatalogState = { type: 'all', q: query.q || '', chip: query.type || '', f: {}, opts: new Set(), sort: 'pop', commercial: !!query.commercial };
  const items = Store.allItems();
  setMeta({ title: T('searchTitle') + (CatalogState.q ? `: ${CatalogState.q}` : '') });
  const people = CatalogState.q ? Store.db.scientists.filter(s => [s.name.ru, s.name.kz, s.name.en, L(s.position), (s.interests || []).join(' ')].join(' ').toLowerCase().includes(CatalogState.q.toLowerCase())) : [];
  return `
  <section class="page-hero page-hero--brand">
    <div class="container">
      <nav class="crumbs"><a href="#/">${T('nav_home')}</a><span>/</span><b>${T('searchTitle')}</b></nav>
      <h1 class="h1">${CatalogState.commercial ? T('h_commercial') : T('searchTitle')}</h1>
      <form class="hero-search hero-search--page" data-catalog-search>${icon('search', 22)}<input name="q" type="search" value="${esc(CatalogState.q)}" placeholder="${esc(T('searchPh'))}"><button class="btn btn--primary">${T('search')}</button></form>
      <div class="chips" data-chips>
        <button class="chip ${!CatalogState.chip ? 'active' : ''}" data-chip="">${T('all')}</button>
        ${Object.entries(SECTIONS).map(([k, s]) => `<button class="chip chip--${s.color} ${CatalogState.chip === k ? 'active' : ''}" data-chip="${k}">${icon(s.icon, 15)} ${T(s.nav)}</button>`).join('')}
      </div>
    </div>
  </section>
  ${people.length ? `<section class="container"><div class="people-row">${people.map(personChip).join('')}</div></section>` : ''}
  <section class="container catalog">
    <aside class="filters" id="filters">${filtersPanel('all', items)}</aside>
    <div class="catalog__main">
      <div class="catalog__bar">
        <button class="btn btn--soft filters-toggle" data-filters-open>${icon('filter', 18)} ${T('filters')}</button>
        <span class="catalog__count" id="resultCount"></span>
        <label class="sort">${T('sort')}: <select data-sort><option value="pop">${T('sort_pop')}</option><option value="new">${T('sort_new')}</option><option value="az">${T('sort_az')}</option></select></label>
      </div>
      <div class="grid" id="grid"></div>
    </div>
  </section>`;
};

function personChip(s) {
  const fac = Store.faculty(s.faculty);
  return `<a class="person-chip" href="#/scientists/${s.id}"><span class="avatar avatar--lg">${esc(L(s.name).split(' ').map(w => w[0]).join(''))}</span><div><b>${esc(L(s.name))}</b><span>${esc(L(s.degree))}</span><small>${esc(L(fac && fac.name))}</small></div>${icon('arrow', 18)}</a>`;
}

/* ========== DETAIL (shared shell) ========== */
function gallery(it, type) {
  const variants = [0, 1, 2];
  return `<div class="gallery gallery--${SECTIONS[type].color}">
    <div class="gallery__main ${type === 'books' ? 'gallery__main--book' : ''}" id="galMain">${art(it, type, 0)}</div>
    <div class="gallery__thumbs">
      ${variants.map(v => `<button class="gallery__thumb ${v === 0 ? 'active' : ''}" data-gal="${v}" aria-label="image ${v + 1}">${art(it, type, v)}</button>`).join('')}
      ${type !== 'books' ? `<button class="gallery__thumb gallery__thumb--video" data-gal="video" aria-label="video">${icon('play', 22)}<span>Video</span></button>` : ''}
    </div>
  </div>`;
}

function detailShell(it, type, { summary, body, ctas }) {
  const sec = SECTIONS[type];
  const sc = Store.scientist(it.scientist || (it.authors || [])[0]);
  const fac = Store.faculty(it.faculty), lab = Store.lab(it.lab);
  const related = Store.list(type).filter(x => x.id !== it.id && (x.faculty === it.faculty || x.category === it.category || x.industry === it.industry)).slice(0, 4);
  return `
  <section class="detail container">
    <nav class="crumbs"><a href="#/">${T('nav_home')}</a><span>/</span><a href="#/${type}">${T(sec.nav)}</a><span>/</span><b>${esc(L(it.title))}</b></nav>
    <div class="detail__top">
      ${gallery(it, type)}
      <div class="summary">
        <div class="summary__meta"><span class="sec-tag sec-tag--${sec.color}">${icon(sec.icon, 14)} ${esc(sec.brand)}</span><span>${itemMeta(it, type)}</span></div>
        <h1 class="summary__title">${esc(L(it.title))}</h1>
        <p class="summary__lead">${esc(L(it.short))}</p>
        ${summary}
        <div class="summary__ctas">${ctas}</div>
        ${sc ? `<a class="dev-link" href="#/scientists/${sc.id}"><span class="avatar">${esc(L(sc.name).split(' ').map(w => w[0]).join(''))}</span><div><small>${T('developer')}</small><b>${esc(L(sc.name))}</b><span>${esc(L(lab && lab.name) || L(fac && fac.name))}</span></div><em>${T('allWorks')} ${icon('arrow', 14)}</em></a>` : ''}
        <button class="share" data-share>${icon('link', 16)} ${T('share')}</button>
      </div>
    </div>
    <div class="detail__grid">
      <div class="detail__body">${body}</div>
      <aside class="detail__side">${contactCard(it.contact)}
        <button class="btn btn--primary btn--block" data-request='${esc(JSON.stringify({ type, id: it.id, kind: 'info' }))}'>${icon('send', 18)} ${T('leaveRequest')}</button>
      </aside>
    </div>
    ${related.length ? `<div class="rail rail--flat"><div class="rail__head"><h2 class="h2">${T('h_new')}</h2></div><div class="grid grid--4">${related.map(r => card(r, type)).join('')}</div></div>` : ''}
  </section>
  <div class="mobile-cta">${T('leaveRequest') ? `<button class="btn btn--primary btn--block" data-request='${esc(JSON.stringify({ type, id: it.id, kind: type === 'products' ? 'buy' : type === 'patents' ? 'license' : 'implement' }))}'>${icon('send', 18)} ${T('leaveRequest')}</button>` : ''}</div>`;
}

function kv(rows) {
  rows = rows.filter(r => r[1] !== undefined && r[1] !== null && r[1] !== '');
  return `<dl class="kv">${rows.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${v}</dd></div>`).join('')}</dl>`;
}
function block(title, html, iconName) {
  if (!html) return '';
  return `<section class="dblock"><h2 class="dblock__title">${iconName ? icon(iconName, 20) : ''}${esc(title)}</h2>${html}</section>`;
}
function list(arr, cls = 'ticks') { return arr && arr.length ? `<ul class="${cls}">${arr.map(a => `<li>${icon('check', 16)}<span>${esc(a)}</span></li>`).join('')}</ul>` : ''; }
function reqBtn(label, type, id, kind, cls = 'btn--soft', ic = 'send') { return `<button class="btn ${cls}" data-request='${esc(JSON.stringify({ type, id, kind }))}'>${icon(ic, 18)} ${esc(label)}</button>`; }
function linkBtn(label, url, cls, ic, type, id) { return `<a class="btn ${cls}" href="${esc(safeUrl(url))}" target="_blank" rel="noopener" data-track="${esc(label)}" data-type="${type}" data-id="${esc(id)}">${icon(ic, 18)} ${esc(label)}</a>`; }

/* ---------- Product ---------- */
Views.product = function (id) {
  const it = Store.get('products', id); if (!it || !it.published) return Views.notFound();
  Store.trackView('products', id);
  const patents = (it.patents || []).map(pid => Store.get('patents', pid)).filter(Boolean);
  setMeta({ title: L(it.title), description: L(it.short), keywords: [L(ENUMS.productCategories[it.category]), it.science].join(', '),
    ld: { '@context': 'https://schema.org', '@type': 'Product', name: L(it.title), description: L(it.desc), category: L(ENUMS.productCategories[it.category]), brand: { '@type': 'Brand', name: 'FARABI PRODUCT' }, manufacturer: { '@type': 'CollegeOrUniversity', name: 'Al-Farabi Kazakh National University' } } });
  const summary = `
    <div class="summary__badges">${stageBadge(it.stage)}${it.hasCert ? badge(T('o_cert'), 'blue') : ''}${patents.length ? badge(T('o_patent'), 'amber') : ''}</div>
    <div class="facts"><div><small>${T('price')}</small><b>${esc(it.price || '—')}</b></div><div><small>${T('moq')}</small><b>${esc(it.moq || '—')}</b></div></div>
    ${it.marketplaces && it.marketplaces.length ? `<div class="wherebuy"><h3>${icon('cart', 18)} ${T('whereBuy')}</h3>${mpButtons(it, 'products')}</div>` : ''}`;
  const ctas = [reqBtn(T('order'), 'products', id, 'order', 'btn--primary', 'cart'), reqBtn(T('implement'), 'products', id, 'implement'), reqBtn(T('contract'), 'products', id, 'buy', 'btn--soft', 'file')].join('');
  const body = `
    ${block(T('stage'), stageChain(it.stage), 'gauge')}
    ${block(T('t_desc'), `<p class="prose">${esc(L(it.desc))}</p>${kv([[T('purpose'), esc(it.purpose)], [T('application'), esc(it.application)], [T('composition'), esc(it.composition)]])}`, 'file')}
    ${block(T('advantages'), list(it.advantages), 'star')}
    ${block(T('t_specs'), it.specs && it.specs.length ? `<table class="specs">${it.specs.map(([k, v]) => `<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`).join('')}</table>` : '', 'layers')}
    ${block(T('t_tests'), `${it.tests ? `<p class="prose">${esc(it.tests)}</p>` : ''}
      ${(it.certificates || []).length ? `<div class="docs">${it.certificates.map(c => `<a class="doc" href="#" onclick="return false">${icon('award', 20)}<span>${esc(c)}</span><em>PDF</em></a>`).join('')}</div>` : ''}
      ${patents.length ? `<h4 class="sub">${T('patentsL')}</h4><div class="docs">${patents.map(p => `<a class="doc doc--ip" href="${itemUrl('patents', p.id)}">${icon('award', 20)}<span>${esc(p.number)} — ${esc(L(p.title))}</span>${icon('arrow', 16)}</a>`).join('')}</div>` : ''}`, 'shield')}
    ${block(T('science'), kv([[T('science'), esc(it.science)], [T('faculty'), esc(L((Store.faculty(it.faculty) || {}).name))], [T('lab'), esc(L((Store.lab(it.lab) || {}).name))]]), 'microscope')}`;
  return detailShell(it, 'products', { summary, body, ctas });
};

/* ---------- AI ---------- */
Views.ai = function (id) {
  const it = Store.get('ai', id); if (!it || !it.published) return Views.notFound();
  Store.trackView('ai', id);
  const sup = Store.scientist(it.supervisor);
  setMeta({ title: L(it.title), description: L(it.short), keywords: [L(ENUMS.industries[it.industry]), 'AI', ...(it.features || [])].join(', '),
    ld: { '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: L(it.title), description: L(it.desc), applicationCategory: L(ENUMS.industries[it.industry]), creator: { '@type': 'CollegeOrUniversity', name: 'Al-Farabi Kazakh National University' } } });
  const L_ = it.links || {};
  const summary = `
    <div class="summary__badges">${trlBadge(it.trl)}${badge(L(ENUMS.industries[it.industry]), 'violet')}${it.patent ? badge(T('o_patent'), 'amber') : ''}</div>
    <div class="trl"><div class="trl__bar"><span style="width:${it.trl / 9 * 100}%"></span></div><small>${T('trl')}: <b>${it.trl}/9</b></small></div>`;
  const ctas = [
    L_.demo ? linkBtn(T('demo'), L_.demo, 'btn--primary', 'play', 'ai', id) : '',
    L_.try ? linkBtn(T('tryIt'), L_.try, 'btn--soft', 'rocket', 'ai', id) : '',
    L_.buy ? linkBtn(T('buy'), L_.buy, 'btn--soft', 'cart', 'ai', id) : reqBtn(T('buy'), 'ai', id, 'buy', 'btn--soft', 'cart'),
    reqBtn(T('reqImplement'), 'ai', id, 'implement', L_.demo ? 'btn--soft' : 'btn--primary', 'rocket'),
    reqBtn(T('reqLicense'), 'ai', id, 'license', 'btn--soft', 'key'),
    reqBtn(T('contactDev'), 'ai', id, 'info', 'btn--soft', 'chat')
  ].join('');
  const body = `
    ${block(T('t_desc'), `<p class="prose">${esc(L(it.desc))}</p>`, 'file')}
    <div class="duo">
      ${block(T('problem'), `<p class="prose">${esc(it.problem)}</p>`, 'bulb')}
      ${block(T('audience'), `<p class="prose">${esc(it.audience)}</p><p class="muted">${T('industry')}: ${esc(L(ENUMS.industries[it.industry]))}</p>`, 'users')}
    </div>
    ${block(T('features'), `<div class="features">${(it.features || []).map((f, i) => `<div class="feature"><span>${String(i + 1).padStart(2, '0')}</span>${esc(f)}</div>`).join('')}</div>`, 'grid')}
    ${block(T('t_specs'), it.specs && it.specs.length ? `<table class="specs">${it.specs.map(([k, v]) => `<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`).join('')}</table>` : '', 'layers')}
    ${block(T('advantages'), list(it.advantages), 'star')}
    ${block(T('testing'), `<p class="prose">${esc(it.testing)}</p>${kv([[T('hasPatent'), it.patent ? T('yes') : T('no')]])}`, 'shield')}
    ${block(T('t_team'), `${kv([[T('supervisor'), sup ? `<a href="#/scientists/${sup.id}">${esc(L(sup.name))}</a>` : '—'], [T('faculty'), esc(L((Store.faculty(Store.scientist(it.scientist)?.faculty) || {}).name))]])}<div class="team">${(it.team || []).map(m => `<span class="team__m"><span class="avatar avatar--sm">${esc(m.replace(/[^А-ЯA-ZӘҒҚҢӨҰҮІ]/g, '').slice(0, 2))}</span>${esc(m)}</span>`).join('')}</div>`, 'users')}`;
  return detailShell({ ...it, faculty: (Store.scientist(it.scientist) || {}).faculty, lab: (Store.scientist(it.scientist) || {}).lab }, 'ai', { summary, body, ctas });
};

/* ---------- Patent ---------- */
Views.patent = function (id) {
  const it = Store.get('patents', id); if (!it || !it.published) return Views.notFound();
  Store.trackView('patents', id);
  const authors = (it.authors || []).map(a => Store.scientist(a)).filter(Boolean);
  const sup = Store.scientist(it.supervisor);
  setMeta({ title: `${it.number} — ${L(it.title)}`, description: L(it.short), keywords: [L(ENUMS.patentKinds[it.kind]), it.application, it.number].join(', '),
    ld: { '@context': 'https://schema.org', '@type': 'CreativeWork', additionalType: 'Patent', name: L(it.title), identifier: it.number, dateCreated: it.regDate, datePublished: it.pubDate, author: authors.map(a => ({ '@type': 'Person', name: L(a.name) })), copyrightHolder: it.holder } });
  const summary = `
    <div class="summary__badges">${statusBadge(it.status)}${badge(L(ENUMS.patentKinds[it.kind]), 'gray')}</div>
    <div class="facts facts--3"><div><small>${T('number')}</small><b>${esc(it.number)}</b></div><div><small>${T('regDate')}</small><b>${fmtDate(it.regDate)}</b></div><div><small>${T('validUntil')}</small><b>${/\d{4}-/.test(it.validUntil) ? fmtDate(it.validUntil) : esc(it.validUntil)}</b></div></div>`;
  const ctas = [reqBtn(T('reqCommercial'), 'patents', id, 'license', 'btn--primary', 'rocket'), it.pdf ? `<a class="btn btn--soft" href="${esc(safeUrl(it.pdf))}" target="_blank" rel="noopener">${icon('download', 18)} ${T('download')}</a>` : ''].join('');
  const body = `
    ${block(T('t_desc'), `<p class="prose">${esc(it.desc)}</p>`, 'file')}
    <div class="duo">
      ${block(T('techProblem'), `<p class="prose">${esc(it.problem)}</p>`, 'bulb')}
      ${block(T('solution'), `<p class="prose">${esc(it.solution)}</p>`, 'check')}
    </div>
    ${block(T('advantages'), list(it.advantages), 'star')}
    ${block(T('potential'), kv([[T('application'), esc(it.application)], [T('potential'), esc(it.potential)], [T('status'), statusBadge(it.status)]]), 'chart')}
    ${block(T('docPdf'), `${kv([[T('number'), esc(it.number)], [T('regDate'), fmtDate(it.regDate)], [T('pubDate'), fmtDate(it.pubDate)], [T('holder'), esc(it.holder)], [T('country'), esc(it.country)],
      [T('authors'), authors.map(a => `<a href="#/scientists/${a.id}">${esc(L(a.name))}</a>`).join(', ')], [T('supervisor'), sup ? `<a href="#/scientists/${sup.id}">${esc(L(sup.name))}</a>` : ''],
      [T('faculty'), esc(L((Store.faculty(it.faculty) || {}).name))], [T('dept'), esc(it.dept)], [T('lab'), esc(L((Store.lab(it.lab) || {}).name))]])}
      ${it.pdf ? `<div class="docs"><a class="doc doc--ip" href="${esc(safeUrl(it.pdf))}" target="_blank" rel="noopener">${icon('file', 20)}<span>${esc(it.number)}.pdf</span><em>PDF</em></a></div>` : ''}`, 'award')}`;
  return detailShell(it, 'patents', { summary, body, ctas });
};

/* ---------- Book ---------- */
Views.book = function (id) {
  const it = Store.get('books', id); if (!it || !it.published) return Views.notFound();
  Store.trackView('books', id);
  const authors = (it.authors || []).map(a => Store.scientist(a)).filter(Boolean);
  setMeta({ title: L(it.title), description: L(it.short), keywords: (it.keywords || []).join(', '),
    ld: { '@context': 'https://schema.org', '@type': 'Book', name: L(it.title), isbn: it.isbn, numberOfPages: it.pages, datePublished: String(it.year), publisher: it.publisher, inLanguage: it.lang, author: authors.map(a => ({ '@type': 'Person', name: L(a.name) })), offers: it.price ? { '@type': 'Offer', price: it.price.replace(/\D/g, ''), priceCurrency: 'KZT' } : undefined } });
  const summary = `
    <div class="summary__badges">${badge(L(ENUMS.bookKinds[it.kind]), 'rose')}${badge(it.lang, 'gray')}</div>
    <div class="facts facts--3"><div><small>${T('price')}</small><b>${esc(it.price || '—')}</b></div><div><small>${T('printV')}</small><b>${it.print ? '✓ ' + T('available') : T('notAvailable')}</b></div><div><small>${T('ebookV')}</small><b>${it.ebook ? '✓ ' + T('available') : T('notAvailable')}</b></div></div>`;
  const ctas = [
    reqBtn(T('buy'), 'books', id, 'buy', 'btn--primary', 'cart'),
    it.ebook && it.ebookUrl ? `<a class="btn btn--soft" href="${esc(safeUrl(it.ebookUrl))}" target="_blank" rel="noopener">${icon('download', 18)} ${T('downloadE')}</a>` : '',
    it.print ? reqBtn(T('orderPrint'), 'books', id, 'order', 'btn--soft', 'book') : '',
    it.buyUrl ? linkBtn(T('buyMp'), it.buyUrl, 'btn--soft', 'external', 'books', id) : '',
    reqBtn(T('contactAuthor'), 'books', id, 'info', 'btn--soft', 'chat')
  ].join('');
  const body = `
    ${block(T('annotation'), `<p class="prose">${esc(it.annotation)}</p>`, 'file')}
    ${block(T('toc'), `<ol class="toc">${(it.toc || []).map(c => `<li>${esc(c)}</li>`).join('')}</ol>`, 'bookOpen')}
    ${block(T('docPdf'), kv([[T('authors'), authors.map(a => `<a href="#/scientists/${a.id}">${esc(L(a.name))}</a>`).join(', ')], [T('faculty'), esc(L((Store.faculty(it.faculty) || {}).name))], [T('dept'), esc(it.dept)],
      [T('year'), esc(it.year)], [T('publisher'), esc(it.publisher)], ['ISBN', esc(it.isbn)], [T('pages'), esc(it.pages)], [T('language'), esc(it.lang)]]), 'book')}
    ${block(T('keywords'), `<div class="tags">${(it.keywords || []).map(k => `<a class="tag" href="#/search?q=${encodeURIComponent(k)}">#${esc(k)}</a>`).join('')}</div>`, 'tag')}`;
  return detailShell(it, 'books', { summary, body, ctas });
};

/* ========== SCIENTIST ========== */
Views.scientist = function (id) {
  const s = Store.scientist(id); if (!s) return Views.notFound();
  const fac = Store.faculty(s.faculty), lab = Store.lab(s.lab);
  const works = Store.allItems().filter(it => Store.people(it).includes(id) || it.supervisor === id);
  const by = t => works.filter(w => w._type === t);
  setMeta({ title: L(s.name), description: `${L(s.degree)}, ${L(fac && fac.name)}`, ld: { '@context': 'https://schema.org', '@type': 'Person', name: L(s.name), jobTitle: L(s.position), affiliation: { '@type': 'CollegeOrUniversity', name: 'Al-Farabi Kazakh National University' } } });
  const hide = Store.db.settings.hidePersonalPhones;
  return `
  <section class="container detail">
    <nav class="crumbs"><a href="#/">${T('nav_home')}</a><span>/</span><b>${T('scientistCard')}</b></nav>
    <div class="profile">
      <div class="profile__photo">${s.photo ? `<img src="${esc(safeUrl(s.photo))}" alt="">` : `<span>${esc(L(s.name).split(' ').map(w => w[0]).join(''))}</span>`}</div>
      <div class="profile__info">
        <span class="sec-tag sec-tag--brand">${icon('graduation', 14)} ${T('scientistCard')}</span>
        <h1 class="h1">${esc(L(s.name))}</h1>
        <p class="profile__pos">${esc(L(s.position))} · ${esc(L(s.degree))}</p>
        <div class="profile__org">${icon('building', 16)} ${esc(L(fac && fac.name))}${s.dept ? ` · ${esc(L(s.dept))}` : ''}${lab ? ` · ${esc(L(lab.name))}` : ''}</div>
        <div class="tags">${(s.interests || []).map(i => `<a class="tag" href="#/search?q=${encodeURIComponent(i)}">#${esc(i)}</a>`).join('')}</div>
        <div class="profile__contacts"><a class="chip" href="mailto:${esc(s.email)}">${icon('mail', 15)} ${esc(s.email)}</a>${!hide && s.phone ? `<a class="chip" href="tel:${esc(s.phone.replace(/[^+\d]/g, ''))}">${icon('phone', 15)} ${esc(s.phone)}</a>` : ''}</div>
      </div>
      <div class="profile__stats">${Object.keys(SECTIONS).map(t => `<div class="pstat pstat--${SECTIONS[t].color}"><b>${by(t).length}</b><span>${T('stat_' + t)}</span></div>`).join('')}</div>
    </div>
    <div class="detail__grid">
      <div class="detail__body">
        ${block(T('bio'), `<p class="prose">${esc(L(s.bio))}</p>`, 'user')}
        ${block(T('publications'), `<ul class="pubs">${(s.publications || []).map(p => `<li>${icon('file', 16)}<span>${esc(p)}</span></li>`).join('')}</ul>`, 'bookOpen')}
      </div>
      <aside class="detail__side"><button class="btn btn--primary btn--block" data-request='{"kind":"info"}'>${icon('chat', 18)} ${T('contactDev')}</button></aside>
    </div>
    <h2 class="h2 mt">${T('allWorks')}</h2>
    ${Object.keys(SECTIONS).map(t => by(t).length ? `<h3 class="h3 sec-h sec-h--${SECTIONS[t].color}">${icon(SECTIONS[t].icon, 18)} ${T(SECTIONS[t].nav)}</h3><div class="grid grid--4">${by(t).map(w => card(w, t)).join('')}</div>` : '').join('')}
  </section>`;
};

/* ========== BUSINESS ========== */
Views.business = function (query) {
  setMeta({ title: T('bizTitle'), description: T('bizSub') });
  return `
  <section class="page-hero page-hero--brand">
    <div class="container"><nav class="crumbs"><a href="#/">${T('nav_home')}</a><span>/</span><b>${T('bizTitle')}</b></nav>
      <h1 class="h1">${T('bizTitle')}</h1><p class="page-hero__desc">${T('bizSub')}</p></div>
  </section>
  <section class="container">
    <div class="scenarios">${ENUMS.bizScenarios.map((s, i) => `
      <button class="scenario" data-scenario="${s.k}"><span class="scenario__n">${String(i + 1).padStart(2, '0')}</span>${icon(s.icon, 28)}<b>${esc(L(s))}</b>${s.to ? `<a class="scenario__link" href="${s.to}" onclick="event.stopPropagation()">${T('viewAll')} ${icon('arrow', 14)}</a>` : ''}</button>`).join('')}
    </div>
    <div class="biz-form">
      <div class="biz-form__aside">
        <h2 class="h2">${T('bizForm')}</h2>
        <p class="muted">${T('ctaSub')}</p>
        <ol class="steps"><li>${T('send')}</li><li>${T('responsible')}</li><li>${L({ ru: 'Переговоры и договор', kz: 'Келіссөздер және шарт', en: 'Negotiation & contract' })}</li><li>${L({ ru: 'Внедрение', kz: 'Енгізу', en: 'Implementation' })}</li></ol>
        ${contactCard(null)}
      </div>
      <div class="biz-form__main" id="bizFormWrap">${requestForm({ business: true, scenario: query.s || 'implement' })}</div>
    </div>
  </section>`;
};

/* ========== ABOUT / CONTACTS ========== */
Views.about = function () {
  setMeta({ title: T('aboutTitle') });
  const all = Store.allItems();
  const facts = [['1934', { ru: 'год основания', kz: 'құрылған жылы', en: 'founded' }], [String(all.length), { ru: 'разработок на платформе', kz: 'платформадағы әзірлемелер', en: 'developments on the platform' }], [String(Store.db.scientists.length), { ru: 'учёных-разработчиков', kz: 'ғалым-әзірлеушілер', en: 'scientists & developers' }], [String(all.filter(i => Store.commercial(i)).length), { ru: 'доступно для коммерциализации', kz: 'коммерцияландыруға қолжетімді', en: 'available for commercialization' }]];
  return `
  <section class="page-hero page-hero--brand"><div class="container"><nav class="crumbs"><a href="#/">${T('nav_home')}</a><span>/</span><b>${T('aboutTitle')}</b></nav>
    <h1 class="h1">${T('aboutTitle')}</h1><p class="page-hero__desc">${L({ ru: 'Казахский национальный университет имени аль-Фараби — ведущий исследовательский университет Казахстана. FARABI PRODUCT превращает научные результаты в готовые продукты, технологии и объекты ИС, доступные бизнесу.', kz: 'Әл-Фараби атындағы Қазақ ұлттық университеті — Қазақстанның жетекші зерттеу университеті. FARABI PRODUCT ғылыми нәтижелерді бизнеске қолжетімді өнімдерге айналдырады.', en: 'Al-Farabi Kazakh National University is the leading research university of Kazakhstan. FARABI PRODUCT turns research results into products, technologies and IP available to business.' })}</p></div></section>
  <section class="container"><div class="facts-big">${facts.map(([n, l]) => `<div><b>${n}</b><span>${esc(L(l))}</span></div>`).join('')}</div>
    <h2 class="h2 mt">${T('f_faculty')}</h2><div class="fac-list">${Store.db.faculties.map(f => { const n = Store.allItems().filter(i => i.faculty === f.id).length; return `<a class="fac" href="#/search?faculty=${f.id}">${icon('building', 20)}<span>${esc(L(f.name))}</span><b>${n}</b></a>`; }).join('')}</div>
    <h2 class="h2 mt">${T('f_lab')}</h2><div class="fac-list">${Store.db.labs.map(l => `<a class="fac" href="#/search?lab=${l.id}">${icon('microscope', 20)}<span>${esc(L(l.name))}</span><b>${Store.allItems().filter(i => i.lab === l.id).length}</b></a>`).join('')}</div>
  </section>`;
};

Views.contacts = function () {
  setMeta({ title: T('contactsTitle') });
  const c = Store.db.settings.corporate;
  return `
  <section class="page-hero page-hero--brand"><div class="container"><nav class="crumbs"><a href="#/">${T('nav_home')}</a><span>/</span><b>${T('contactsTitle')}</b></nav><h1 class="h1">${T('contactsTitle')}</h1><p class="page-hero__desc">${esc(L(c.name))}</p></div></section>
  <section class="container contacts-page">
    <div class="contacts-info">
      <div class="cinfo">${icon('pin', 22)}<div><small>${T('address')}</small><b>${esc(L(c.address))}</b></div></div>
      <div class="cinfo">${icon('phone', 22)}<div><small>${T('phone')}</small><a href="tel:${esc(c.phone.replace(/[^+\d]/g, ''))}">${esc(c.phone)}</a></div></div>
      <div class="cinfo">${icon('mail', 22)}<div><small>${T('email')}</small><a href="mailto:${esc(c.email)}">${esc(c.email)}</a></div></div>
      <div class="contact__msgs">${c.whatsapp ? `<a class="chip chip--wa" href="https://wa.me/${esc(c.whatsapp.replace(/\D/g, ''))}" target="_blank" rel="noopener">${icon('chat', 15)} WhatsApp</a>` : ''}${c.telegram ? `<a class="chip chip--tg" href="https://t.me/${esc(c.telegram)}" target="_blank" rel="noopener">${icon('send', 15)} Telegram</a>` : ''}</div>
      <h3 class="h3 mt">${T('responsible')}</h3>
      <div class="team-list">${Store.db.contacts.map(p => `<div class="person"><span class="avatar">${esc(L(p.name).split(' ').map(w => w[0]).join(''))}</span><div><b>${esc(L(p.name))}</b><span>${esc(L(p.position))}</span><a href="mailto:${esc(p.email)}">${esc(p.email)}</a></div></div>`).join('')}</div>
    </div>
    <div class="card-form"><h2 class="h2">${T('writeUs')}</h2>${requestForm({ kind: 'info' }).replace('<div class="form__head">', '<div class="form__head" hidden>')}</div>
  </section>`;
};

Views.notFound = function () {
  setMeta({ title: '404' });
  return `<section class="container empty empty--page"><h1 class="h1">404</h1><p>${T('nothing')}</p><a class="btn btn--primary" href="#/">${T('nav_home')}</a></section>`;
};
