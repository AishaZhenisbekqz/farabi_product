/* Shared UI helpers & components */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

function esc(v) {
  return String(v == null ? '' : v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function safeUrl(u) {
  u = String(u || '').trim();
  return /^(https?:|mailto:|tel:|#)/i.test(u) ? u : '#';
}
function hash(str) { let h = 2166136261; for (const ch of String(str)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
function fmtDate(s) {
  if (!s) return '—';
  const d = new Date(s); if (isNaN(d)) return esc(s);
  return d.toLocaleDateString(LANG === 'en' ? 'en-GB' : LANG === 'kz' ? 'kk-KZ' : 'ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
function fmtNum(n) { return Number(n || 0).toLocaleString('ru-RU'); }

/* ---------- Generated visuals (used when no photo is uploaded) ---------- */
const ART = {
  products: ['#053d2f', '#10b981', '#b8f5dc'],
  ai: ['#170f45', '#7c5cff', '#38d6f5'],
  patents: ['#3d1a02', '#f59e0b', '#ffe7a3'],
  books: ['#45071c', '#f0507a', '#ffd1dc']
};
function art(it, type, variant = 0) {
  if (it.image && variant === 0) return `<img src="${esc(safeUrl(it.image))}" alt="${esc(L(it.title))}" loading="lazy">`;
  const [d, m, l] = ART[type];
  const h = hash(it.id + variant);
  const r = n => ((h >> n) & 255) / 255;
  const uid = 'g' + h.toString(36);
  if (type === 'books') {
    const title = esc(L(it.title));
    return `<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" class="art">
      <defs><linearGradient id="${uid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${d}"/><stop offset="1" stop-color="${m}"/></linearGradient>
      <linearGradient id="${uid}c" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${m}"/><stop offset="1" stop-color="${d}"/></linearGradient></defs>
      <rect width="400" height="300" fill="${d}"/><circle cx="${60 + r(1) * 280}" cy="${r(5) * 300}" r="160" fill="${m}" opacity=".35"/>
      <g transform="translate(${130 + variant * 6} 28) rotate(${-4 + r(3) * 8} 70 122)">
        <rect x="8" y="10" width="140" height="244" rx="6" fill="#000" opacity=".25"/>
        <rect width="140" height="244" rx="6" fill="url(#${uid}c)"/><rect width="10" height="244" fill="#000" opacity=".18"/>
        <rect x="22" y="26" width="98" height="3" fill="${l}"/><rect x="22" y="200" width="60" height="3" fill="${l}" opacity=".7"/>
        <foreignObject x="20" y="44" width="110" height="150"><div xmlns="http://www.w3.org/1999/xhtml" lang="ru" class="art-book-title">${title}</div></foreignObject>
        <text x="22" y="226" fill="${l}" font-size="9" font-family="Inter,sans-serif" letter-spacing="2">FARABI BOOKS</text>
      </g></svg>`;
  }
  const ic = ICONS[it.icon || SECTIONS[type].icon] || ICONS.box;
  const grid = Array.from({ length: 9 }, (_, i) => `<path d="M${i * 50} 0V300M0 ${i * 50}H400" stroke="${l}" stroke-opacity=".07"/>`).join('');
  const extra = type === 'patents'
    ? `<g opacity=".9"><rect x="250" y="40" width="110" height="140" rx="8" fill="#fff" fill-opacity=".1" stroke="${l}" stroke-opacity=".35"/><path d="M266 70h78M266 86h60M266 102h70M266 118h48" stroke="${l}" stroke-opacity=".45" stroke-width="4" stroke-linecap="round"/><circle cx="334" cy="156" r="14" fill="none" stroke="${l}" stroke-opacity=".6" stroke-width="3"/></g>`
    : type === 'ai' ? `<g stroke="${l}" stroke-opacity=".5" fill="none">${Array.from({ length: 6 }, (_, i) => `<circle cx="${40 + r(i) * 320}" cy="${30 + r(i + 7) * 240}" r="3" fill="${l}"/>`).join('')}<path d="M${40 + r(0) * 320} ${30 + r(7) * 240}L${40 + r(1) * 320} ${30 + r(8) * 240}L${40 + r(2) * 320} ${30 + r(9) * 240}L${40 + r(3) * 320} ${30 + r(10) * 240}"/></g>` : '';
  return `<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" class="art">
    <defs><radialGradient id="${uid}" cx="${0.3 + r(2) * 0.4}" cy="${0.3 + r(4) * 0.4}" r=".8"><stop offset="0" stop-color="${m}"/><stop offset="1" stop-color="${d}"/></radialGradient>
    <filter id="${uid}b"><feGaussianBlur stdDeviation="30"/></filter></defs>
    <rect width="400" height="300" fill="url(#${uid})"/>
    <g filter="url(#${uid}b)"><circle cx="${r(6) * 400}" cy="${r(9) * 300}" r="90" fill="${l}" opacity=".35"/><circle cx="${r(11) * 400}" cy="${r(13) * 300}" r="70" fill="${d}" opacity=".7"/></g>
    ${grid}${extra}
    <g transform="translate(${type === 'patents' ? 90 : 150 + variant * 30} ${80 - variant * 10})">
      <circle cx="50" cy="70" r="${62 + variant * 8}" fill="#fff" fill-opacity=".1" stroke="#fff" stroke-opacity=".25"/>
      <g transform="translate(14 34) scale(3)" fill="none" stroke="#fff" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">${ic}</g>
    </g></svg>`;
}

/* ---------- Badges ---------- */
function badge(text, color = 'gray') { return `<span class="badge badge--${color}">${esc(text)}</span>`; }
function stageBadge(stage) { const c = stage >= 8 ? 'teal' : stage >= 6 ? 'green' : stage >= 4 ? 'amber' : 'gray'; return badge(L(ENUMS.stages[stage] || ''), c); }
function statusBadge(st) { const s = ENUMS.patentStatus[st]; return s ? badge(L(s), s.c) : ''; }
function trlBadge(trl) { return badge('TRL ' + trl, trl >= 7 ? 'green' : trl >= 5 ? 'amber' : 'gray'); }

function itemUrl(type, id) { return `#/${type}/${encodeURIComponent(id)}`; }

function itemMeta(it, type) {
  if (type === 'products') return L(ENUMS.productCategories[it.category]);
  if (type === 'ai') return L(ENUMS.industries[it.industry]);
  if (type === 'patents') return `${esc(it.number)} · ${L(ENUMS.patentKinds[it.kind])}`;
  if (type === 'books') return `${L(ENUMS.bookKinds[it.kind])} · ${it.year}`;
  return '';
}
function itemBadge(it, type) {
  if (type === 'products') return stageBadge(it.stage);
  if (type === 'ai') return trlBadge(it.trl);
  if (type === 'patents') return statusBadge(it.status);
  if (type === 'books') return it.ebook ? badge('PDF / e-book', 'rose') : badge(T('printV'), 'gray');
  return '';
}
function personNames(it) {
  return Store.people(it).map(id => { const s = Store.scientist(id); return s ? L(s.name) : id; }).join(', ');
}

/* ---------- Card ---------- */
function card(it, type) {
  type = type || it._type;
  const sec = SECTIONS[type];
  const mps = (it.marketplaces || []).slice(0, 3).map(m => `<span class="mp-dot mp-${mpKey(m.name)}" title="${esc(m.name)}">${esc(mpShort(m.name))}</span>`).join('');
  const price = it.price ? `<span class="card__price">${esc(it.price)}</span>` : '';
  return `<article class="card card--${sec.color}">
    <a class="card__media ${type === 'books' ? 'card__media--book' : ''}" href="${itemUrl(type, it.id)}" tabindex="-1" aria-hidden="true">${art(it, type)}
      <span class="card__sec">${icon(sec.icon, 14)} ${esc(sec.brand)}</span></a>
    <div class="card__body">
      <div class="card__meta">${itemMeta(it, type)}</div>
      <h3 class="card__title"><a href="${itemUrl(type, it.id)}">${esc(L(it.title))}</a></h3>
      <p class="card__text">${esc(L(it.short))}</p>
      <div class="card__foot">${itemBadge(it, type)}${price}</div>
      ${mps ? `<div class="card__mps">${mps}</div>` : ''}
    </div>
  </article>`;
}
function mpKey(n) { n = n.toLowerCase(); return n.includes('kaspi') ? 'kaspi' : n.includes('ozon') ? 'ozon' : n.includes('wild') ? 'wb' : 'site'; }
function mpShort(n) { const k = mpKey(n); return k === 'kaspi' ? 'Kaspi' : k === 'ozon' ? 'Ozon' : k === 'wb' ? 'WB' : '↗'; }

function mpButtons(it, type) {
  const list = it.marketplaces || [];
  if (!list.length) return '';
  return `<div class="mp-list">${list.map(m => `<a class="mp-btn mp-btn--${mpKey(m.name)}" href="${esc(safeUrl(m.url))}" target="_blank" rel="noopener" data-mp="${esc(m.name)}" data-type="${type}" data-id="${esc(it.id)}">
    <span class="mp-btn__logo">${esc(mpShort(m.name) === '↗' ? m.name.slice(0, 1) : mpShort(m.name))}</span><span class="mp-btn__name">${esc(m.name)}</span>${icon('external', 16)}</a>`).join('')}</div>`;
}

/* ---------- Contact card ---------- */
function contactCard(contactId) {
  const st = Store.db.settings;
  const c = Store.contact(contactId);
  const corp = st.corporate;
  const usePersonal = c && !st.hidePersonalPhones;
  const phone = usePersonal ? c.phone : corp.phone;
  const wa = (usePersonal ? c.whatsapp : corp.whatsapp) || '';
  const tg = (usePersonal ? c.telegram : corp.telegram) || '';
  const email = c ? c.email : corp.email;
  const initials = c ? L(c.name).split(' ').map(w => w[0]).join('').slice(0, 2) : 'FP';
  return `<div class="contact">
    <div class="contact__label">${T('responsible')}</div>
    <div class="contact__person"><span class="avatar">${esc(initials)}</span><div><b>${esc(c ? L(c.name) : L(corp.name))}</b><span>${esc(c ? L(c.position) : '')}</span></div></div>
    <div class="contact__lines">
      <a href="tel:${esc(phone.replace(/[^+\d]/g, ''))}">${icon('phone', 16)} ${esc(phone)}${!usePersonal && c ? ` <small>· ${T('corporate')}</small>` : ''}</a>
      <a href="mailto:${esc(email)}">${icon('mail', 16)} ${esc(email)}</a>
    </div>
    <div class="contact__msgs">
      ${wa ? `<a class="chip chip--wa" href="https://wa.me/${esc(wa.replace(/\D/g, ''))}" target="_blank" rel="noopener">${icon('chat', 15)} WhatsApp</a>` : ''}
      ${tg ? `<a class="chip chip--tg" href="https://t.me/${esc(tg)}" target="_blank" rel="noopener">${icon('send', 15)} Telegram</a>` : ''}
    </div>
  </div>`;
}

/* ---------- Readiness chain ---------- */
function stageChain(stage) {
  return `<ol class="chain">${ENUMS.stages.map((s, i) => `<li class="${i < stage ? 'done' : i === stage ? 'now' : ''}"><span></span><em>${esc(L(s))}</em></li>`).join('')}</ol>`;
}

/* ---------- Modal ---------- */
const Modal = {
  open(html, wide) {
    $('#modalBody').innerHTML = html;
    $('#modal').hidden = false;
    $('#modal .modal__dialog').classList.toggle('modal__dialog--wide', !!wide);
    document.body.classList.add('no-scroll');
    const f = $('#modalBody input, #modalBody select, #modalBody textarea'); if (f) setTimeout(() => f.focus(), 50);
  },
  close() { $('#modal').hidden = true; document.body.classList.remove('no-scroll'); $('#modalBody').innerHTML = ''; }
};

function toast(title, text, kind = 'ok') {
  const el = document.createElement('div');
  el.className = 'toast toast--' + kind;
  el.innerHTML = `${icon(kind === 'ok' ? 'check' : kind === 'bell' ? 'bell' : 'x', 18)}<div><b>${esc(title)}</b>${text ? `<span>${esc(text)}</span>` : ''}</div>`;
  $('#toasts').appendChild(el);
  setTimeout(() => el.classList.add('out'), 4200);
  setTimeout(() => el.remove(), 4700);
}

/* ---------- Request form (per-card & business) ---------- */
function requestForm({ type, id, kind = 'info', kinds, business = false, scenario } = {}) {
  const it = type && id ? Store.get(type, id) : null;
  const kindList = kinds || Object.keys(ENUMS.requestKinds);
  const opts = kindList.map(k => `<option value="${k}" ${k === kind ? 'selected' : ''}>${esc(L(ENUMS.requestKinds[k]))}</option>`).join('');
  const scen = ENUMS.bizScenarios.map(s => `<option value="${s.k}" ${s.k === scenario ? 'selected' : ''}>${esc(L(s))}</option>`).join('');
  const industries = Object.entries(ENUMS.industries).map(([k, v]) => `<option value="${k}">${esc(L(v))}</option>`).join('');
  return `<form class="form" id="reqForm" novalidate data-type="${type || ''}" data-id="${esc(id || '')}" data-business="${business ? 1 : ''}">
    ${!business ? `<div class="form__head"><span class="form__eyebrow">${T('reqTitle')}</span><h3>${it ? esc(L(it.title)) : T('proposeCoop')}</h3></div>` : ''}
    <div class="form__grid">
      ${business
        ? `<label class="field field--full"><span>${T('coopType')} *</span><select name="scenario" required>${scen}</select></label>`
        : `<label class="field field--full"><span>${T('reqKind')} *</span><select name="kind" required>${opts}</select></label>`}
      <label class="field"><span>${T('company')} *</span><input name="company" required autocomplete="organization"></label>
      <label class="field"><span>${T('bin')}</span><input name="bin" inputmode="numeric" maxlength="12" placeholder="000000000000"></label>
      <label class="field"><span>${T('fio')} *</span><input name="name" required autocomplete="name"></label>
      <label class="field"><span>${T('position')}</span><input name="position" autocomplete="organization-title"></label>
      <label class="field"><span>${T('phone')} *</span><input name="phone" required type="tel" autocomplete="tel" placeholder="+7"></label>
      <label class="field"><span>${T('email')} *</span><input name="email" required type="email" autocomplete="email"></label>
      ${business ? `<label class="field"><span>${T('industry')}</span><select name="industry"><option value="">—</option>${industries}</select></label>
      <label class="field"><span>${T('techInterest')}</span><input name="tech" list="techList"><datalist id="techList">${Store.allItems().map(x => `<option value="${esc(L(x.title))}">`).join('')}</datalist></label>` : ''}
      ${!business && type === 'patents' ? `<label class="field field--full"><span>${T('coopType')}</span><select name="coop">${['license', 'transfer', 'coprod', 'invest'].map(k => `<option value="${k}">${esc(L(ENUMS.patentStatus[k]))}</option>`).join('')}</select></label>` : ''}
      <label class="field field--full"><span>${T('comment')}</span><textarea name="comment" rows="3"></textarea></label>
      ${business ? `<label class="field field--full file"><input type="file" name="file" accept=".pdf,.doc,.docx,.png,.jpg,.pptx"><span class="file__btn">${icon('upload', 18)} ${T('attach')}</span><em class="file__name"></em></label>` : ''}
      <label class="check field--full"><input type="checkbox" name="consent" required><span>${T('consent')}</span></label>
    </div>
    <div class="form__err" role="alert"></div>
    <button class="btn btn--primary btn--lg btn--block" type="submit">${icon('send', 18)} ${T('send')}</button>
  </form>`;
}

function openRequest(opts) { Modal.open(requestForm(opts)); }

function submitRequest(form) {
  const fd = new FormData(form);
  const v = k => (fd.get(k) || '').toString().trim();
  const err = $('.form__err', form);
  $$('.field', form).forEach(f => f.classList.remove('invalid'));
  const req = ['company', 'name', 'phone', 'email'];
  const missing = req.filter(k => !v(k));
  missing.forEach(k => form.elements[k].closest('.field').classList.add('invalid'));
  if (missing.length || !fd.get('consent')) { err.textContent = T('required'); return; }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v('email'))) { form.elements.email.closest('.field').classList.add('invalid'); err.textContent = T('badEmail'); return; }
  if (v('bin') && !/^\d{12}$/.test(v('bin'))) { form.elements.bin.closest('.field').classList.add('invalid'); err.textContent = T('badBin'); return; }
  const business = !!form.dataset.business;
  const file = form.elements.file && form.elements.file.files[0];
  const r = Store.addRequest({
    kind: business ? (['buy', 'implement', 'license', 'invest', 'partner'].includes(v('scenario')) ? v('scenario') : 'partner') : v('kind'),
    scenario: v('scenario') || '', itemType: form.dataset.type || '', itemId: form.dataset.id || '',
    company: v('company'), bin: v('bin'), name: v('name'), position: v('position'), phone: v('phone'), email: v('email'),
    industry: v('industry'), tech: v('tech'), coop: v('coop'), comment: v('comment'), file: file ? file.name : ''
  });
  const it = r.itemType ? Store.get(r.itemType, r.itemId) : null;
  const resp = it && Store.contact(it.contact);
  const html = `<div class="success">${icon('check', 40)}<h3>${T('reqSent')}</h3><p>${esc(T('reqSentD', { n: r.id }))}</p>
    <div class="success__num">${esc(r.id)}</div><small>${fmtDate(r.created)} ${r.created.slice(11, 16)}</small></div>`;
  if (form.closest('.modal')) $('#modalBody').innerHTML = html; else form.outerHTML = html;
  setTimeout(() => toast('📨 ' + (resp ? L(resp.name) : L(Store.db.settings.corporate.name)), `${r.id} → ${resp ? resp.email : Store.db.settings.corporate.email}`, 'bell'), 600);
}

/* ---------- SEO ---------- */
function setMeta({ title, description, keywords, ld, image }) {
  document.title = title ? `${title} — FARABI PRODUCT` : 'FARABI PRODUCT — ' + T('tagline');
  const set = (sel, attr, val) => { let m = document.head.querySelector(sel); if (!m) { m = document.createElement('meta'); const [k, v] = sel.match(/\[(.+?)="(.+?)"\]/).slice(1); m.setAttribute(k, v); document.head.appendChild(m); } m.setAttribute(attr, val || ''); };
  const desc = description || T('heroSub');
  set('meta[name="description"]', 'content', desc);
  set('meta[name="keywords"]', 'content', keywords || 'КазНУ, FARABI PRODUCT, коммерциализация');
  set('meta[property="og:title"]', 'content', document.title);
  set('meta[property="og:description"]', 'content', desc);
  set('meta[property="og:url"]', 'content', location.href);
  if (image) set('meta[property="og:image"]', 'content', image);
  $('#ld-json').textContent = JSON.stringify(ld || { '@context': 'https://schema.org', '@type': 'Organization', name: 'FARABI PRODUCT', parentOrganization: 'Al-Farabi Kazakh National University' });
}
