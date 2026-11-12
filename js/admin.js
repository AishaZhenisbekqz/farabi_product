/* Admin panel (demo: roles emulated on the client; production = server-side auth & RBAC) */

const ROLES = {
  super: { ru: 'Суперадминистратор', kz: 'Суперәкімші', en: 'Super administrator' },
  center: { ru: 'Администратор Центра коммерциализации', kz: 'Коммерцияландыру орталығының әкімшісі', en: 'Commercialization Center admin' },
  scientist: { ru: 'Ответственный учёный / разработчик', kz: 'Жауапты ғалым / әзірлеуші', en: 'Responsible scientist / developer' }
};

const opt = (obj) => Object.entries(obj).map(([k, v]) => [k, L(v)]);
const SCHEMA = {
  products: [
    ['id', 'slug', 'URL (slug)'], ['published', 'bool', 'Опубликовано'], ['featured', 'bool', 'Популярное / на главной'],
    ['title', 'ml', 'Название'], ['short', 'ml', 'Краткое описание'], ['desc', 'mlarea', 'Полное описание'],
    ['category', 'select', 'Категория', () => opt(ENUMS.productCategories)], ['stage', 'select', 'Степень готовности', () => ENUMS.stages.map((s, i) => [i, L(s)])],
    ['image', 'image', 'Фото (главное)'], ['video', 'text', 'Видео (URL)'],
    ['purpose', 'text', 'Назначение'], ['application', 'text', 'Область применения'], ['composition', 'text', 'Состав'],
    ['specs', 'specs', 'Технические характеристики (Параметр: значение)'], ['advantages', 'lines', 'Преимущества (по строке)'],
    ['tests', 'area', 'Результаты испытаний'], ['certificates', 'lines', 'Сертификаты (по строке)'], ['hasCert', 'bool', 'Есть сертификат'],
    ['patents', 'multi', 'Патенты', () => Store.db.patents.map(p => [p.id, p.number + ' — ' + L(p.title)])],
    ['science', 'text', 'Научная основа'], ['scientist', 'select', 'Разработчик', scOpts], ['faculty', 'select', 'Факультет', facOpts], ['lab', 'select', 'Лаборатория', labOpts],
    ['moq', 'text', 'Мин. объём заказа'], ['price', 'text', 'Ориентировочная стоимость'], ['contact', 'select', 'Ответственный', ctOpts],
    ['marketplaces', 'mp', 'Где купить — ссылки на маркетплейсы']
  ],
  ai: [
    ['id', 'slug', 'URL (slug)'], ['published', 'bool', 'Опубликовано'], ['featured', 'bool', 'На главной'],
    ['title', 'ml', 'Название'], ['short', 'ml', 'Краткое описание'], ['desc', 'mlarea', 'Описание'],
    ['industry', 'select', 'Отрасль', () => opt(ENUMS.industries)], ['trl', 'select', 'TRL', () => [1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => [n, 'TRL ' + n])],
    ['image', 'image', 'Логотип / скриншот'], ['video', 'text', 'Демо-видео (URL)'],
    ['problem', 'area', 'Решаемая проблема'], ['audience', 'text', 'Целевая аудитория'], ['features', 'lines', 'Функции (по строке)'],
    ['specs', 'specs', 'Технические характеристики'], ['advantages', 'lines', 'Преимущества'], ['testing', 'area', 'Результаты тестирования'], ['patent', 'bool', 'Есть патент / свидетельство'],
    ['scientist', 'select', 'Разработчик', scOpts], ['supervisor', 'select', 'Научный руководитель', scOpts], ['team', 'lines', 'Команда (по строке)'], ['contact', 'select', 'Ответственный', ctOpts],
    ['links.demo', 'text', 'Ссылка «Демо»'], ['links.try', 'text', 'Ссылка «Попробовать»'], ['links.buy', 'text', 'Ссылка «Купить»']
  ],
  patents: [
    ['id', 'slug', 'URL (slug)'], ['published', 'bool', 'Опубликовано'],
    ['number', 'text', 'Номер'], ['kind', 'select', 'Тип объекта ИС', () => opt(ENUMS.patentKinds)], ['status', 'select', 'Статус', () => opt(ENUMS.patentStatus)],
    ['title', 'ml', 'Название'], ['short', 'ml', 'Кратко'], ['regDate', 'date', 'Дата регистрации'], ['pubDate', 'date', 'Дата публикации'], ['validUntil', 'text', 'Срок действия'],
    ['holder', 'text', 'Правообладатель'], ['country', 'text', 'Страна регистрации'], ['authors', 'multi', 'Авторы', scOpts], ['supervisor', 'select', 'Научный руководитель', scOpts],
    ['faculty', 'select', 'Факультет', facOpts], ['dept', 'text', 'Кафедра'], ['lab', 'select', 'Лаборатория', labOpts],
    ['desc', 'area', 'Описание'], ['problem', 'area', 'Техническая проблема'], ['solution', 'area', 'Решение'], ['advantages', 'lines', 'Преимущества'],
    ['application', 'text', 'Область применения'], ['potential', 'text', 'Коммерческий потенциал'], ['image', 'image', 'Изображение / схема'], ['pdf', 'file', 'PDF документа'], ['contact', 'select', 'Ответственный', ctOpts]
  ],
  books: [
    ['id', 'slug', 'URL (slug)'], ['published', 'bool', 'Опубликовано'], ['featured', 'bool', 'На главной'],
    ['title', 'ml', 'Название'], ['short', 'ml', 'Кратко'], ['kind', 'select', 'Тип издания', () => opt(ENUMS.bookKinds)], ['image', 'image', 'Обложка'],
    ['authors', 'multi', 'Авторы', scOpts], ['faculty', 'select', 'Факультет', facOpts], ['dept', 'text', 'Кафедра'], ['year', 'number', 'Год'], ['publisher', 'text', 'Издательство'],
    ['isbn', 'text', 'ISBN'], ['pages', 'number', 'Страниц'], ['lang', 'text', 'Язык'], ['annotation', 'area', 'Аннотация'], ['toc', 'lines', 'Содержание (по строке)'], ['keywords', 'lines', 'Ключевые слова'],
    ['price', 'text', 'Стоимость'], ['print', 'bool', 'Есть печатная версия'], ['ebook', 'bool', 'Есть электронная версия'], ['ebookUrl', 'file', 'Электронная версия (PDF)'], ['buyUrl', 'text', 'Ссылка на покупку / маркетплейс'], ['contact', 'select', 'Ответственный', ctOpts]
  ],
  scientists: [
    ['id', 'slug', 'ID'], ['name', 'ml', 'ФИО'], ['position', 'ml', 'Должность'], ['degree', 'ml', 'Учёная степень'], ['faculty', 'select', 'Факультет', facOpts], ['dept', 'ml', 'Кафедра'], ['lab', 'select', 'Лаборатория', labOpts],
    ['photo', 'image', 'Фотография'], ['interests', 'lines', 'Научные интересы'], ['bio', 'mlarea', 'Биография'], ['publications', 'lines', 'Публикации'], ['email', 'text', 'E-mail'], ['phone', 'text', 'Телефон']
  ],
  contacts: [
    ['id', 'slug', 'ID'], ['name', 'ml', 'ФИО'], ['position', 'ml', 'Должность'], ['phone', 'text', 'Телефон'], ['email', 'text', 'E-mail'], ['whatsapp', 'text', 'WhatsApp'], ['telegram', 'text', 'Telegram (username)']
  ]
};
function scOpts() { return [['', '—'], ...Store.db.scientists.map(s => [s.id, L(s.name)])]; }
function facOpts() { return [['', '—'], ...Store.db.faculties.map(f => [f.id, L(f.name)])]; }
function labOpts() { return [['', '—'], ...Store.db.labs.map(l => [l.id, L(l.name)])]; }
function ctOpts() { return Store.db.contacts.map(c => [c.id, L(c.name)]); }

const getPath = (o, p) => p.split('.').reduce((a, k) => (a == null ? a : a[k]), o);
const setPath = (o, p, v) => { const ks = p.split('.'); const last = ks.pop(); const t = ks.reduce((a, k) => (a[k] = a[k] || {}), o); t[last] = v; };

const Admin = {
  user: null,
  tab: 'dash',
  reqFilter: '',

  init() { try { this.user = JSON.parse(sessionStorage.getItem('fp_admin') || 'null'); } catch (e) { this.user = null; } },
  can(action, item) {
    if (!this.user) return false;
    if (this.user.role === 'super') return true;
    if (this.user.role === 'center') return !['settings', 'roles'].includes(action) || action === 'settings';
    if (this.user.role === 'scientist') {
      if (['dash', 'requests', 'settings', 'categories', 'contacts', 'scientists', 'log', 'create'].includes(action)) return action === 'create';
      if (!item) return true;
      return item.scientist === this.user.sid || (item.authors || []).includes(this.user.sid) || item.supervisor === this.user.sid;
    }
    return false;
  },
  ownItems(type) {
    const all = Store.db[type] || [];
    if (this.user.role !== 'scientist') return all;
    return all.filter(i => this.can('edit', i));
  },

  render(sub) {
    this.init();
    document.body.classList.add('is-admin');
    setMeta({ title: T('admin') });
    if (!this.user) return this.loginView();
    if (sub) this.tab = sub;
    const isSci = this.user.role === 'scientist';
    const tabs = [
      ['dash', 'chart', { ru: 'Аналитика', kz: 'Аналитика', en: 'Analytics' }, !isSci],
      ['products', 'box', { ru: 'Продукты', kz: 'Өнімдер', en: 'Products' }, true],
      ['ai', 'cpu', { ru: 'AI-разработки', kz: 'AI-әзірлемелер', en: 'AI solutions' }, true],
      ['patents', 'award', { ru: 'Патенты', kz: 'Патенттер', en: 'Patents' }, true],
      ['books', 'bookOpen', { ru: 'Книги', kz: 'Кітаптар', en: 'Books' }, true],
      ['requests', 'inbox', { ru: 'Заявки', kz: 'Өтінімдер', en: 'Requests' }, !isSci],
      ['scientists', 'graduation', { ru: 'Учёные', kz: 'Ғалымдар', en: 'Scientists' }, !isSci],
      ['contacts', 'users', { ru: 'Ответственные', kz: 'Жауаптылар', en: 'Responsible' }, !isSci],
      ['categories', 'tag', { ru: 'Категории', kz: 'Санаттар', en: 'Categories' }, !isSci],
      ['settings', 'cog', { ru: 'Настройки', kz: 'Баптаулар', en: 'Settings' }, !isSci],
      ['log', 'history', { ru: 'Журнал действий', kz: 'Әрекеттер журналы', en: 'Audit log' }, this.user.role === 'super']
    ].filter(t => t[3]);
    if (!tabs.some(t => t[0] === this.tab)) this.tab = tabs[0][0];
    const newReq = Store.db.requests.filter(r => r.status === 'new').length;
    return `<div class="admin">
      <aside class="admin__side">
        <a class="logo logo--admin" href="#/"><span class="logo__mark">F</span><span class="logo__text">FARABI<b>ADMIN</b></span></a>
        <nav class="admin__nav">${tabs.map(([k, ic, l]) => `<a href="#/admin/${k}" class="${this.tab === k ? 'active' : ''}">${icon(ic, 18)}<span>${esc(L(l))}</span>${k === 'requests' && newReq ? `<em>${newReq}</em>` : ''}</a>`).join('')}</nav>
        <div class="admin__user"><span class="avatar">${esc(this.user.label.slice(0, 1))}</span><div><b>${esc(this.user.label)}</b><small>${esc(L(ROLES[this.user.role]))}</small></div><button class="icon-btn" data-admin-logout title="Logout">${icon('logout', 18)}</button></div>
      </aside>
      <div class="admin__main" id="adminMain">${this.tabView()}</div>
    </div>`;
  },

  loginView() {
    return `<div class="admin-login"><div class="admin-login__card">
      <a class="logo" href="#/"><span class="logo__mark">F</span><span class="logo__text">FARABI<b>PRODUCT</b></span></a>
      <h1 class="h2">${T('admin')}</h1>
      <p class="muted">${L({ ru: 'Демо-режим: выберите роль для входа. В рабочей версии — защищённая авторизация на сервере (HTTPS, 2FA, защита от brute-force).', kz: 'Демо-режим: кіру үшін рөлді таңдаңыз. Жұмыс нұсқасында — серверлік қорғалған авторизация.', en: 'Demo mode: pick a role to sign in. Production uses secure server-side auth (HTTPS, 2FA, brute-force protection).' })}</p>
      <form id="adminLogin" class="form">
        <label class="field"><span>${L({ ru: 'Роль', kz: 'Рөл', en: 'Role' })}</span><select name="role">${Object.entries(ROLES).map(([k, v]) => `<option value="${k}">${esc(L(v))}</option>`).join('')}</select></label>
        <label class="field" id="sciPick" hidden><span>${T('developer')}</span><select name="sid">${Store.db.scientists.map(s => `<option value="${s.id}">${esc(L(s.name))}</option>`).join('')}</select></label>
        <button class="btn btn--primary btn--lg btn--block">${icon('lock', 18)} ${L({ ru: 'Войти', kz: 'Кіру', en: 'Sign in' })}</button>
      </form>
      <a class="link" href="#/">${icon('arrowLeft', 16)} ${T('back')}</a>
    </div></div>`;
  },

  login(form) {
    const role = form.role.value;
    const sid = form.sid.value;
    const label = role === 'scientist' ? L(Store.scientist(sid).name) : L(ROLES[role]).split(' ')[0];
    this.user = { role, sid: role === 'scientist' ? sid : null, label };
    try { sessionStorage.setItem('fp_admin', JSON.stringify(this.user)); } catch (e) {}
    Store.log('login', 'Вход в систему: ' + L(ROLES[role]), label); Store.save();
    location.hash = '#/admin/' + (role === 'scientist' ? 'products' : 'dash');
    App.route();
  },
  logout() { this.user = null; try { sessionStorage.removeItem('fp_admin'); } catch (e) {} location.hash = '#/admin'; App.route(); },

  tabView() {
    const t = this.tab;
    if (t === 'dash') return this.dash();
    if (['products', 'ai', 'patents', 'books', 'scientists', 'contacts'].includes(t)) return this.table(t);
    if (t === 'requests') return this.requests();
    if (t === 'categories') return this.categories();
    if (t === 'settings') return this.settings();
    if (t === 'log') return this.logView();
    return '';
  },

  head(title, actions = '') { return `<div class="admin__head"><h1 class="h2">${esc(title)}</h1><div class="admin__actions">${actions}</div></div>`; },

  /* ---------- Dashboard ---------- */
  dash() {
    const db = Store.db;
    const all = ['products', 'ai', 'patents', 'books'].flatMap(t => db[t].map(i => ({ ...i, _type: t })));
    const views = all.reduce((s, i) => s + (i.views || 0), 0);
    const mpTotal = Object.values(db.stats.mpClicks).reduce((a, b) => a + b, 0);
    const reqs = db.requests;
    const implReq = reqs.filter(r => r.kind === 'implement').length, licReq = reqs.filter(r => r.kind === 'license').length;
    const commercialReq = reqs.filter(r => ['implement', 'license', 'invest', 'partner', 'buy', 'order'].includes(r.kind)).length;
    const buyers = new Set(reqs.map(r => (r.bin || r.company || '').toLowerCase())).size;
    const kpi = (v, l, ic, hl) => `<div class="kpi ${hl ? 'kpi--hl' : ''}">${icon(ic, 20)}<b>${fmtNum(v)}</b><span>${esc(l)}</span></div>`;
    const topProducts = [...db.products].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 6).map(p => [L(p.title), p.views || 0]);
    const topViewed = [...all].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 6).map(p => [L(p.title), p.views || 0]);
    const byFac = db.faculties.map(f => [L(f.name).replace(/^(Факультет|Высшая школа) /, ''), all.filter(i => i.faculty === f.id || (i._type === 'ai' && (Store.scientist(i.scientist) || {}).faculty === f.id)).length]).filter(x => x[1]).sort((a, b) => b[1] - a[1]);
    const byCat = Object.entries(ENUMS.productCategories).map(([k, v]) => [L(v), db.products.filter(p => p.category === k).length]).filter(x => x[1]).sort((a, b) => b[1] - a[1]);
    const byKind = Object.entries(ENUMS.requestKinds).map(([k, v]) => [L(v), reqs.filter(r => r.kind === k).length]).sort((a, b) => b[1] - a[1]);
    const mp = Object.entries(db.stats.mpClicks).sort((a, b) => b[1] - a[1]);
    return `${this.head(L({ ru: 'Аналитика', kz: 'Аналитика', en: 'Analytics' }), `<button class="btn btn--soft" data-export="requests">${icon('download', 18)} CSV</button>`)}
      <div class="kpis kpis--key">
        ${kpi(mpTotal, L({ ru: 'Переходов «Купить»', kz: '«Сатып алу» өтулері', en: '“Buy” clicks' }), 'cart', 1)}
        ${kpi(reqs.length, L({ ru: 'Заявок', kz: 'Өтінімдер', en: 'Requests' }), 'inbox', 1)}
        ${kpi(commercialReq, L({ ru: 'Коммерческих запросов', kz: 'Коммерциялық сұраныстар', en: 'Commercial requests' }), 'briefcase', 1)}
      </div>
      <div class="kpis">
        ${kpi(db.products.length, T('stat_products'), 'box')}${kpi(db.ai.length, T('stat_ai'), 'cpu')}${kpi(db.patents.length, T('stat_patents'), 'award')}${kpi(db.books.length, T('stat_books'), 'bookOpen')}
        ${kpi(all.filter(i => i.published).length, L({ ru: 'Опубликовано', kz: 'Жарияланған', en: 'Published' }), 'globe')}${kpi(views, L({ ru: 'Просмотров', kz: 'Қаралым', en: 'Views' }), 'eye')}
        ${kpi(implReq, L({ ru: 'Запросов на внедрение', kz: 'Енгізу сұраныстары', en: 'Implementation requests' }), 'rocket')}${kpi(licReq, L({ ru: 'Запросов на лицензию', kz: 'Лицензия сұраныстары', en: 'License requests' }), 'key')}
        ${kpi(buyers, L({ ru: 'Потенциальных покупателей', kz: 'Әлеуетті сатып алушылар', en: 'Potential buyers' }), 'users')}
      </div>
      <div class="charts">
        ${barChart(L({ ru: 'Популярные продукты · просмотры', kz: 'Танымал өнімдер · қаралым', en: 'Popular products · views' }), topProducts)}
        ${barChart(L({ ru: 'Самые просматриваемые разработки', kz: 'Ең көп қаралған әзірлемелер', en: 'Most viewed developments' }), topViewed)}
        ${barChart(L({ ru: 'Переходы на маркетплейсы', kz: 'Маркетплейстерге өтулер', en: 'Marketplace clicks' }), mp)}
        ${barChart(L({ ru: 'Заявки по видам', kz: 'Өтінімдер түрлері бойынша', en: 'Requests by type' }), byKind)}
        ${barChart(L({ ru: 'Разработки по факультетам', kz: 'Факультеттер бойынша', en: 'By faculty' }), byFac)}
        ${barChart(L({ ru: 'Продукты по категориям', kz: 'Санаттар бойынша өнімдер', en: 'Products by category' }), byCat)}
      </div>`;
  },

  /* ---------- CRUD table ---------- */
  table(type) {
    const items = ['scientists', 'contacts'].includes(type) ? Store.db[type] : this.ownItems(type);
    const labels = { products: 'Продукты', ai: 'AI-разработки', patents: 'Патенты', books: 'Книги', scientists: 'Учёные', contacts: 'Ответственные за коммерциализацию' };
    const hasPub = !['scientists', 'contacts'].includes(type);
    const sub = it => type === 'products' ? L(ENUMS.productCategories[it.category]) : type === 'ai' ? L(ENUMS.industries[it.industry]) : type === 'patents' ? it.number : type === 'books' ? `${it.year} · ${it.isbn}` : type === 'scientists' ? L(it.position) : it.email;
    const st = it => type === 'products' ? stageBadge(it.stage) : type === 'ai' ? trlBadge(it.trl) : type === 'patents' ? `<select class="mini-select" data-status="${esc(it.id)}">${Object.entries(ENUMS.patentStatus).map(([k, v]) => `<option value="${k}" ${it.status === k ? 'selected' : ''}>${esc(L(v))}</option>`).join('')}</select>` : '';
    return `${this.head(labels[type], `<input class="admin-search" type="search" placeholder="${esc(T('search'))}…" data-admin-filter>${this.can('create') ? `<button class="btn btn--primary" data-edit="${type}" data-id="">${icon('plus', 18)} ${L({ ru: 'Добавить', kz: 'Қосу', en: 'Add' })}</button>` : ''}`)}
      <div class="table-wrap"><table class="table" data-filterable>
        <thead><tr><th></th><th>${L({ ru: 'Название', kz: 'Атауы', en: 'Title' })}</th>${hasPub ? `<th>${T('status')}</th><th>${L({ ru: 'Просмотры', kz: 'Қаралым', en: 'Views' })}</th><th>${L({ ru: 'Публикация', kz: 'Жариялау', en: 'Published' })}</th>` : ''}<th></th></tr></thead>
        <tbody>${items.map(it => `<tr>
          <td class="table__thumb">${hasPub ? art(it, type) : `<span class="avatar">${esc(L(it.name).slice(0, 1))}</span>`}</td>
          <td><b>${esc(L(it.title || it.name))}</b><small>${esc(sub(it) || '')}</small></td>
          ${hasPub ? `<td>${st(it)}</td><td>${fmtNum(it.views)}</td><td><label class="switch"><input type="checkbox" data-publish="${type}" data-id="${esc(it.id)}" ${it.published ? 'checked' : ''}><span></span></label></td>` : ''}
          <td class="table__act">${hasPub ? `<a class="icon-btn icon-btn--soft" href="${itemUrl(type, it.id)}" target="_blank" title="Open">${icon('eye', 16)}</a>` : ''}<button class="icon-btn icon-btn--soft" data-edit="${type}" data-id="${esc(it.id)}" title="Edit">${icon('edit', 16)}</button>${this.user.role !== 'scientist' ? `<button class="icon-btn icon-btn--soft icon-btn--danger" data-del="${type}" data-id="${esc(it.id)}" title="Delete">${icon('trash', 16)}</button>` : ''}</td>
        </tr>`).join('') || `<tr><td colspan="6" class="muted">${T('nothing')}</td></tr>`}</tbody></table></div>`;
  },

  editForm(type, id) {
    const it = id ? JSON.parse(JSON.stringify((Store.db[type] || []).find(x => x.id === id))) : { published: false, date: new Date().toISOString().slice(0, 10), contact: (Store.db.contacts[0] || {}).id, scientist: this.user.sid || '', authors: this.user.sid ? [this.user.sid] : [], marketplaces: [], stage: 0, trl: 1, status: 'dev' };
    const fields = SCHEMA[type].map(([key, kind, label, src]) => this.field(key, kind, label, src, it)).join('');
    return `<form class="form admin-form" id="editForm" data-type="${type}" data-orig="${esc(id || '')}">
      <div class="form__head"><span class="form__eyebrow">${id ? L({ ru: 'Редактирование', kz: 'Өңдеу', en: 'Edit' }) : L({ ru: 'Новый объект', kz: 'Жаңа нысан', en: 'New item' })}</span><h3>${esc(L(it.title || it.name) || '—')}</h3></div>
      <div class="form__grid">${fields}</div>
      <div class="form__err" role="alert"></div>
      <div class="admin-form__foot"><button type="button" class="btn btn--soft" data-close>${L({ ru: 'Отмена', kz: 'Бас тарту', en: 'Cancel' })}</button><button class="btn btn--primary">${icon('check', 18)} ${L({ ru: 'Сохранить', kz: 'Сақтау', en: 'Save' })}</button></div>
    </form>`;
  },

  field(key, kind, label, src, it) {
    const v = getPath(it, key);
    const n = `name="${key}"`;
    const full = ['ml', 'mlarea', 'area', 'lines', 'specs', 'mp', 'multi', 'image', 'file'].includes(kind) ? ' field--full' : '';
    let input = '';
    switch (kind) {
      case 'slug': input = `<input ${n} value="${esc(v || '')}" required pattern="[a-z0-9\\-]+" placeholder="nanoquqyrt"><small class="hint">farabiproduct.kz/…/<b>${esc(v || 'slug')}</b></small>`; break;
      case 'text': case 'number': case 'date': input = `<input ${n} type="${kind}" value="${esc(v == null ? '' : v)}">`; break;
      case 'area': input = `<textarea ${n} rows="3">${esc(v || '')}</textarea>`; break;
      case 'lines': input = `<textarea ${n} rows="3">${esc((v || []).join('\n'))}</textarea>`; break;
      case 'specs': input = `<textarea ${n} rows="4">${esc((v || []).map(r => r.join(': ')).join('\n'))}</textarea>`; break;
      case 'bool': return `<label class="check field"><input type="checkbox" ${n} ${v ? 'checked' : ''}><span>${esc(label)}</span></label>`;
      case 'select': input = `<select ${n}>${src().map(([k, l]) => `<option value="${esc(k)}" ${String(v) === String(k) ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>`; break;
      case 'multi': input = `<div class="multi">${src().filter(([k]) => k !== '').map(([k, l]) => `<label class="check"><input type="checkbox" name="${key}" value="${esc(k)}" ${(v || []).includes(k) ? 'checked' : ''}><span>${esc(l)}</span></label>`).join('')}</div>`; break;
      case 'ml': case 'mlarea': {
        const val = typeof v === 'object' && v ? v : { ru: v || '' };
        input = `<div class="ml">${['kz', 'ru', 'en'].map(l => `<div class="ml__row"><span class="ml__lang">${l.toUpperCase()}</span>${kind === 'ml' ? `<input name="${key}.${l}" value="${esc(val[l] || '')}" ${l === 'ru' ? 'required' : ''}>` : `<textarea name="${key}.${l}" rows="3">${esc(val[l] || '')}</textarea>`}</div>`).join('')}</div>`; break;
      }
      case 'image': input = `<div class="upload"><div class="upload__prev">${v ? `<img src="${esc(safeUrl(v))}" alt="">` : icon('upload', 24)}</div><div><input type="file" accept="image/*" data-upload="${key}"><input type="hidden" ${n} value="${esc(v || '')}"><input type="url" placeholder="или URL изображения" data-url-for="${key}" value="${esc(v && !String(v).startsWith('data:') ? v : '')}"><small class="hint">JPG/PNG/WebP, до 1 МБ (демо хранит в браузере)</small></div></div>`; break;
      case 'file': input = `<div class="upload upload--file"><input type="file" accept=".pdf" data-upload="${key}"><input type="text" ${n} value="${esc(v && !String(v).startsWith('data:') ? v : (v ? '[PDF загружен]' : ''))}" placeholder="URL PDF"></div>`; break;
      case 'mp': input = `<div class="mp-editor" id="mpEditor">${(v || []).map(m => mpRow(m)).join('')}</div>
        <div class="mp-presets">${['Kaspi', 'Ozon', 'Wildberries', 'Сайт производителя', 'Интернет-магазин', 'Другой маркетплейс'].map(p => `<button type="button" class="chip" data-mp-add="${p}">${icon('plus', 14)} ${p}</button>`).join('')}</div>`; break;
    }
    return `<label class="field${full}"><span>${esc(label)}</span>${input}</label>`;
  },

  saveForm(form) {
    const type = form.dataset.type, orig = form.dataset.orig;
    const coll = Store.db[type];
    const base = orig ? coll.find(x => x.id === orig) : {};
    const it = JSON.parse(JSON.stringify(base || {}));
    const err = $('.form__err', form);
    SCHEMA[type].forEach(([key, kind]) => {
      if (kind === 'ml' || kind === 'mlarea') { setPath(it, key, { kz: form.elements[key + '.kz'].value.trim(), ru: form.elements[key + '.ru'].value.trim(), en: form.elements[key + '.en'].value.trim() }); return; }
      if (kind === 'mp') { it.marketplaces = $$('.mp-row', form).map(r => ({ name: $('[data-mp-name]', r).value.trim(), url: $('[data-mp-url]', r).value.trim() })).filter(m => m.name && m.url); return; }
      if (kind === 'multi') { it[key] = $$(`input[name="${key}"]:checked`, form).map(c => c.value); return; }
      const el = form.elements[key]; if (!el) return;
      if (kind === 'bool') setPath(it, key, el.checked);
      else if (kind === 'lines') setPath(it, key, el.value.split('\n').map(s => s.trim()).filter(Boolean));
      else if (kind === 'specs') setPath(it, key, el.value.split('\n').map(s => s.split(':')).filter(p => p[0].trim()).map(p => [p[0].trim(), p.slice(1).join(':').trim()]));
      else if (kind === 'number' || key === 'stage' || key === 'trl') setPath(it, key, el.value === '' ? '' : Number(el.value));
      else if (kind === 'file' && el.value === '[PDF загружен]') { if (el.dataset.blob) setPath(it, key, el.dataset.blob); }
      else setPath(it, key, el.value.trim());
    });
    if (!/^[a-z0-9-]+$/.test(it.id || '')) { err.textContent = 'URL (slug): латиница, цифры, дефис'; return; }
    if (coll.some(x => x.id === it.id && x.id !== orig)) { err.textContent = 'Такой URL уже существует'; return; }
    if (type === 'products') it.hasCert = it.hasCert || (it.certificates || []).length > 0;
    if (orig) coll[coll.findIndex(x => x.id === orig)] = it; else { it.views = 0; it.clicks = 0; coll.unshift(it); }
    Store.log(orig ? 'edit' : 'create', `${orig ? 'Изменён' : 'Создан'} объект ${type}/${it.id}`);
    Store.save();
    Modal.close();
    toast(L({ ru: 'Сохранено', kz: 'Сақталды', en: 'Saved' }), L(it.title || it.name));
    this.refresh();
  },

  /* ---------- Requests ---------- */
  requests() {
    const rows = Store.db.requests.filter(r => !this.reqFilter || r.status === this.reqFilter);
    const itemTitle = r => { const it = r.itemType && Store.get(r.itemType, r.itemId); return it ? L(it.title) : (r.tech || (r.scenario ? L(ENUMS.bizScenarios.find(s => s.k === r.scenario) || '') : '—')); };
    return `${this.head(L({ ru: 'Заявки', kz: 'Өтінімдер', en: 'Requests' }), `<select data-req-filter class="admin-search"><option value="">${T('all')}</option>${Object.entries(ENUMS.requestStatus).map(([k, v]) => `<option value="${k}" ${this.reqFilter === k ? 'selected' : ''}>${esc(L(v))} (${Store.db.requests.filter(r => r.status === k).length})</option>`).join('')}</select><button class="btn btn--primary" data-export="requests">${icon('download', 18)} ${L({ ru: 'Выгрузить CSV', kz: 'CSV жүктеу', en: 'Export CSV' })}</button>`)}
      <div class="table-wrap"><table class="table">
        <thead><tr><th>№</th><th>${L({ ru: 'Дата и время', kz: 'Күні мен уақыты', en: 'Date & time' })}</th><th>${T('reqKind')}</th><th>${T('company')}</th><th>${T('reqFor')}</th><th>${T('status')}</th><th></th></tr></thead>
        <tbody>${rows.map(r => `<tr>
          <td><b>${esc(r.id)}</b></td><td>${fmtDate(r.created)} <small>${esc(r.created.slice(11, 16))}</small></td>
          <td>${badge(L(ENUMS.requestKinds[r.kind] || { ru: r.kind }), 'gray')}</td>
          <td><b>${esc(r.company)}</b><small>${esc(r.name)} · ${esc(r.phone)}</small></td>
          <td>${esc(itemTitle(r))}</td>
          <td><select class="mini-select mini-select--${(ENUMS.requestStatus[r.status] || {}).c}" data-req-status="${esc(r.id)}">${Object.entries(ENUMS.requestStatus).map(([k, v]) => `<option value="${k}" ${r.status === k ? 'selected' : ''}>${esc(L(v))}</option>`).join('')}</select></td>
          <td class="table__act"><button class="icon-btn icon-btn--soft" data-req-view="${esc(r.id)}">${icon('eye', 16)}</button></td></tr>`).join('') || `<tr><td colspan="7" class="muted">${T('nothing')}</td></tr>`}</tbody></table></div>`;
  },
  requestDetail(id) {
    const r = Store.db.requests.find(x => x.id === id);
    const it = r.itemType && Store.get(r.itemType, r.itemId);
    const resp = it ? Store.contact(it.contact) : null;
    return `<div class="form__head"><span class="form__eyebrow">${T('reqTitle')} ${esc(r.id)}</span><h3>${esc(r.company)}</h3></div>
      ${kv([[L({ ru: 'Дата и время', kz: 'Күні', en: 'Date' }), `${fmtDate(r.created)} ${esc(r.created.slice(11, 16))}`], [T('reqKind'), esc(L(ENUMS.requestKinds[r.kind] || {}))], [T('status'), badge(L(ENUMS.requestStatus[r.status]), ENUMS.requestStatus[r.status].c)],
        [T('reqFor'), it ? `<a href="${itemUrl(r.itemType, r.itemId)}" target="_blank">${esc(L(it.title))}</a>` : esc(r.tech || '—')], [T('coopType'), esc(r.scenario ? L(ENUMS.bizScenarios.find(s => s.k === r.scenario) || {}) : r.coop ? L(ENUMS.patentStatus[r.coop]) : '')],
        [T('bin'), esc(r.bin)], [T('fio'), esc(r.name)], [T('position'), esc(r.position)], [T('phone'), `<a href="tel:${esc(r.phone)}">${esc(r.phone)}</a>`], [T('email'), `<a href="mailto:${esc(r.email)}">${esc(r.email)}</a>`],
        [T('industry'), esc(r.industry ? L(ENUMS.industries[r.industry]) : '')], [T('comment'), esc(r.comment)], [T('attach'), esc(r.file)], [T('responsible'), resp ? `${esc(L(resp.name))} · ${esc(resp.email)}` : esc(L(Store.db.settings.corporate.name))]])}`;
  },
  exportCSV() {
    const cols = ['id', 'created', 'kind', 'status', 'company', 'bin', 'name', 'position', 'phone', 'email', 'industry', 'itemType', 'itemId', 'scenario', 'comment', 'file'];
    const q = v => `"${String(v == null ? '' : v).replace(/"/g, '""')}"`;
    const csv = '﻿' + [cols.join(';'), ...Store.db.requests.map(r => cols.map(c => q(c === 'kind' ? L(ENUMS.requestKinds[r.kind] || {}) : c === 'status' ? L(ENUMS.requestStatus[r.status] || {}) : r[c])).join(';'))].join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = `farabi-requests-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    Store.log('export', 'Выгрузка заявок CSV'); Store.save();
  },

  /* ---------- Categories ---------- */
  categories() {
    const custom = Store.db.customCategories || {};
    return `${this.head(L({ ru: 'Категории продукции', kz: 'Өнім санаттары', en: 'Product categories' }))}
      <form class="inline-form" id="catForm"><input name="key" placeholder="key (latin)" pattern="[a-z0-9]+" required><input name="kz" placeholder="KZ"><input name="ru" placeholder="RU" required><input name="en" placeholder="EN"><button class="btn btn--primary">${icon('plus', 18)}</button></form>
      <div class="cat-list">${Object.entries(ENUMS.productCategories).map(([k, v]) => `<div class="cat"><b>${esc(L(v))}</b><small>${esc(k)} · ${Store.db.products.filter(p => p.category === k).length}</small>${custom[k] ? `<button class="icon-btn icon-btn--danger" data-cat-del="${k}">${icon('trash', 16)}</button>` : ''}</div>`).join('')}</div>`;
  },

  /* ---------- Settings ---------- */
  settings() {
    const s = Store.db.settings, c = s.corporate;
    return `${this.head(L({ ru: 'Настройки', kz: 'Баптаулар', en: 'Settings' }))}
      <form class="form settings" id="settingsForm">
        <label class="check"><input type="checkbox" name="hide" ${s.hidePersonalPhones ? 'checked' : ''}><span>${L({ ru: 'Скрывать личные телефоны и показывать единый корпоративный контакт', kz: 'Жеке телефондарды жасыру', en: 'Hide personal phones and show the corporate contact' })}</span></label>
        <h3 class="h3">${T('corporate')}</h3>
        <div class="form__grid">
          <label class="field"><span>${T('phone')}</span><input name="phone" value="${esc(c.phone)}"></label>
          <label class="field"><span>${T('email')}</span><input name="email" value="${esc(c.email)}"></label>
          <label class="field"><span>WhatsApp</span><input name="whatsapp" value="${esc(c.whatsapp)}"></label>
          <label class="field"><span>Telegram</span><input name="telegram" value="${esc(c.telegram)}"></label>
        </div>
        <button class="btn btn--primary">${icon('check', 18)} ${L({ ru: 'Сохранить', kz: 'Сақтау', en: 'Save' })}</button>
      </form>
      ${this.user.role === 'super' ? `<div class="danger-zone"><h3 class="h3">${L({ ru: 'Демо-данные', kz: 'Демо деректер', en: 'Demo data' })}</h3><p class="muted">${L({ ru: 'Вернуть каталог к исходному состоянию. Все изменения будут потеряны.', kz: 'Каталогты бастапқы күйге қайтару.', en: 'Restore the catalog to its initial state. All changes will be lost.' })}</p><button class="btn btn--danger" data-reset-db>${icon('history', 18)} Reset</button></div>` : ''}`;
  },

  logView() {
    const log = Store.db.log || [];
    return `${this.head(L({ ru: 'Журнал действий', kz: 'Әрекеттер журналы', en: 'Audit log' }))}
      <div class="table-wrap"><table class="table"><thead><tr><th>${L({ ru: 'Время', kz: 'Уақыт', en: 'Time' })}</th><th>${L({ ru: 'Пользователь', kz: 'Пайдаланушы', en: 'User' })}</th><th>${L({ ru: 'Действие', kz: 'Әрекет', en: 'Action' })}</th></tr></thead>
      <tbody>${log.map(l => `<tr><td>${fmtDate(l.at)} <small>${esc(l.at.slice(11, 16))}</small></td><td>${esc(l.who)}</td><td>${esc(l.text)}</td></tr>`).join('') || `<tr><td colspan="3" class="muted">—</td></tr>`}</tbody></table></div>`;
  },

  refresh() { const m = $('#adminMain'); if (m) { m.innerHTML = this.tabView(); } else App.route(); },

  /* ---------- events ---------- */
  bind() {
    document.addEventListener('change', e => {
      const t = e.target;
      if (t.closest('#adminLogin') && t.name === 'role') $('#sciPick').hidden = t.value !== 'scientist';
      if (t.dataset.publish) { const it = Store.get(t.dataset.publish, t.dataset.id); it.published = t.checked; Store.log('publish', `${t.checked ? 'Опубликован' : 'Снят с публикации'}: ${t.dataset.publish}/${it.id}`); Store.save(); toast(t.checked ? 'Опубликовано' : 'Снято с публикации', L(it.title)); }
      if (t.dataset.status) { const it = Store.get('patents', t.dataset.status); it.status = t.value; Store.log('status', `Статус ${it.number} → ${L(ENUMS.patentStatus[t.value])}`); Store.save(); toast('Статус изменён', L(ENUMS.patentStatus[t.value])); }
      if (t.dataset.reqStatus) { const r = Store.db.requests.find(x => x.id === t.dataset.reqStatus); r.status = t.value; Store.log('request', `Заявка ${r.id} → ${L(ENUMS.requestStatus[t.value])}`); Store.save(); t.className = `mini-select mini-select--${ENUMS.requestStatus[t.value].c}`; toast(r.id, L(ENUMS.requestStatus[t.value])); }
      if (t.matches('[data-req-filter]')) { this.reqFilter = t.value; this.refresh(); }
      if (t.dataset.upload) {
        const f = t.files[0]; if (!f) return;
        if (f.size > 1.5 * 1024 * 1024) { toast('Файл слишком большой', 'Демо-версия хранит файлы в браузере (до 1,5 МБ)', 'err'); t.value = ''; return; }
        const rd = new FileReader();
        rd.onload = () => {
          const form = t.closest('form'); form.elements[t.dataset.upload].value = t.accept === '.pdf' ? '[PDF загружен]' : rd.result;
          if (t.accept === '.pdf') { form.elements[t.dataset.upload].dataset.blob = rd.result; }
          const prev = t.closest('.upload').querySelector('.upload__prev'); if (prev) prev.innerHTML = `<img src="${rd.result}" alt="">`;
        };
        rd.readAsDataURL(f);
      }
    });
    document.addEventListener('input', e => {
      const t = e.target;
      if (t.dataset.urlFor) { const form = t.closest('form'); form.elements[t.dataset.urlFor].value = t.value; const prev = t.closest('.upload').querySelector('.upload__prev'); if (prev) prev.innerHTML = t.value ? `<img src="${esc(safeUrl(t.value))}" alt="">` : icon('upload', 24); }
      if (t.matches('[data-admin-filter]')) { const q = t.value.toLowerCase(); $$('[data-filterable] tbody tr').forEach(tr => { tr.hidden = !tr.textContent.toLowerCase().includes(q); }); }
    });
    document.addEventListener('click', e => {
      const t = e.target.closest('[data-edit],[data-del],[data-admin-logout],[data-export],[data-req-view],[data-mp-add],[data-mp-del],[data-cat-del],[data-reset-db]');
      if (!t) return;
      if (t.dataset.edit !== undefined && t.hasAttribute('data-edit')) { Modal.open(this.editForm(t.dataset.edit, t.dataset.id), true); return; }
      if (t.hasAttribute('data-del')) {
        const coll = Store.db[t.dataset.del]; const it = coll.find(x => x.id === t.dataset.id);
        if (!confirm(`Удалить «${L(it.title || it.name)}»? Действие необратимо.`)) return;
        coll.splice(coll.indexOf(it), 1); Store.log('delete', `Удалён ${t.dataset.del}/${it.id}`); Store.save(); this.refresh(); toast('Удалено', L(it.title || it.name)); return;
      }
      if (t.hasAttribute('data-admin-logout')) return this.logout();
      if (t.hasAttribute('data-export')) return this.exportCSV();
      if (t.hasAttribute('data-req-view')) return Modal.open(this.requestDetail(t.dataset.reqView), true);
      if (t.hasAttribute('data-mp-add')) { const ed = $('#mpEditor'); ed.insertAdjacentHTML('beforeend', mpRow({ name: t.dataset.mpAdd === 'Другой маркетплейс' ? '' : t.dataset.mpAdd, url: '' })); $('.mp-row:last-child [data-mp-url]', ed).focus(); return; }
      if (t.hasAttribute('data-mp-del')) { t.closest('.mp-row').remove(); return; }
      if (t.hasAttribute('data-cat-del')) { delete Store.db.customCategories[t.dataset.catDel]; delete ENUMS.productCategories[t.dataset.catDel]; Store.save(); this.refresh(); return; }
      if (t.hasAttribute('data-reset-db')) { if (confirm('Сбросить все данные к демо-версии?')) { Store.reset(); applyCustomCategories(); toast('Данные сброшены'); this.refresh(); } }
    });
    document.addEventListener('submit', e => {
      const f = e.target;
      const fid = f.getAttribute('id'); // not f.id: a field named "id" shadows it
      if (fid === 'adminLogin') { e.preventDefault(); this.login(f); }
      if (fid === 'editForm') { e.preventDefault(); this.saveForm(f); }
      if (fid === 'settingsForm') {
        e.preventDefault(); const s = Store.db.settings;
        s.hidePersonalPhones = f.hide.checked; ['phone', 'email', 'whatsapp', 'telegram'].forEach(k => { s.corporate[k] = f[k].value.trim(); });
        Store.log('settings', 'Изменены настройки контактов'); Store.save(); toast(L({ ru: 'Сохранено', kz: 'Сақталды', en: 'Saved' }));
      }
      if (fid === 'catForm') {
        e.preventDefault(); const k = f.key.value.trim();
        if (ENUMS.productCategories[k]) { toast('Категория уже существует', k, 'err'); return; }
        Store.db.customCategories = Store.db.customCategories || {};
        Store.db.customCategories[k] = { kz: f.kz.value.trim() || f.ru.value.trim(), ru: f.ru.value.trim(), en: f.en.value.trim() || f.ru.value.trim() };
        applyCustomCategories(); Store.log('category', 'Создана категория ' + k); Store.save(); this.refresh();
      }
    });
  }
};

function mpRow(m) {
  return `<div class="mp-row"><span class="mp-btn__logo mp-logo--${mpKey(m.name || 'x')}">${esc((m.name || '?').slice(0, 1))}</span><input data-mp-name placeholder="Название" value="${esc(m.name)}"><input data-mp-url type="url" placeholder="https://…" value="${esc(m.url)}"><button type="button" class="icon-btn icon-btn--danger" data-mp-del>${icon('trash', 16)}</button></div>`;
}

function applyCustomCategories() {
  Object.assign(ENUMS.productCategories, Store.db.customCategories || {});
}

/* single-series horizontal bar chart; one hue, value labels in text ink, native tooltip */
function barChart(title, rows) {
  const max = Math.max(1, ...rows.map(r => r[1]));
  return `<figure class="chart"><figcaption>${esc(title)}</figcaption>
    <div class="bars" role="table">${rows.map(([l, v]) => `<div class="bar" role="row" title="${esc(l)}: ${fmtNum(v)}"><span class="bar__l" role="cell">${esc(l)}</span><span class="bar__track"><span class="bar__fill" style="width:${(v / max * 100).toFixed(1)}%"></span></span><span class="bar__v" role="cell">${fmtNum(v)}</span></div>`).join('')}</div></figure>`;
}
