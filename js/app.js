/* Router & global events */

const App = {
  parse() {
    const h = location.hash.replace(/^#\/?/, '');
    const [path, qs] = h.split('?');
    const parts = path.split('/').filter(Boolean).map(decodeURIComponent);
    const query = Object.fromEntries(new URLSearchParams(qs || ''));
    return { parts, query };
  },

  route() {
    const { parts, query } = this.parse();
    const [a, b] = parts;
    document.body.classList.remove('is-admin', 'filters-open');
    if (!$('#modal').hidden) Modal.close();
    CatalogState = null;
    let html;
    if (!a) html = Views.home();
    else if (SECTIONS[a] && !b) html = Views.catalog(a, query);
    else if (a === 'products') html = Views.product(b);
    else if (a === 'ai') html = Views.ai(b);
    else if (a === 'patents') html = Views.patent(b);
    else if (a === 'books') html = Views.book(b);
    else if (a === 'scientists') html = Views.scientist(b);
    else if (a === 'search') html = Views.search(query);
    else if (a === 'business') html = Views.business(query);
    else if (a === 'about') html = Views.about();
    else if (a === 'contacts') html = Views.contacts();
    else if (a === 'admin') html = Admin.render(b);
    else html = Views.notFound();

    $('#app').innerHTML = html;
    if (CatalogState) {
      // pre-select filters passed via URL
      Object.entries(query).forEach(([k, v]) => { if (['faculty', 'lab', 'author', 'year', 'industry', 'status', 'kind', 'stage'].includes(k)) CatalogState.f[k] = v; });
      $$('[data-filter]').forEach(s => { s.value = CatalogState.f[s.dataset.filter] || ''; });
      const sort = $('[data-sort]'); if (sort) sort.value = CatalogState.sort;
      renderGrid();
    }
    this.renderChrome(a);
    this.closeMenu();
    if (!this._keepScroll) window.scrollTo(0, 0);
    this._keepScroll = false;
    this.reveal();
  },

  renderChrome(active) {
    const navItems = [['', 'nav_home'], ['products', 'nav_products'], ['ai', 'nav_ai'], ['patents', 'nav_patents'], ['books', 'nav_books'], ['about', 'nav_about'], ['business', 'nav_business'], ['contacts', 'nav_contacts']];
    $('#nav').innerHTML = navItems.map(([k, l]) => `<a href="#/${k}" class="${(active || '') === k ? 'active' : ''} ${SECTIONS[k] ? 'nav--' + SECTIONS[k].color : ''}">${T(l)}</a>`).join('')
      + `<a href="#/admin" class="nav__admin">${icon('lock', 16)} ${T('admin')}</a>`;
    $('#lang').innerHTML = ['kz', 'ru', 'en'].map(l => `<button class="${LANG === l ? 'active' : ''}" data-lang="${l}">${l.toUpperCase()}</button>`).join('');
    $('#searchToggle').innerHTML = icon('search', 20);
    $('#burger').innerHTML = icon('menu', 22);
    $('.modal__close').innerHTML = icon('x', 22);
    const c = Store.db.settings.corporate;
    $('#footer').innerHTML = `<div class="container footer__grid">
      <div class="footer__brand"><a href="#/" class="logo logo--light"><span class="logo__mark">F</span><span class="logo__text">FARABI<b>PRODUCT</b></span></a><p>${T('footerAbout')}</p>
        <div class="contact__msgs">${c.whatsapp ? `<a class="chip chip--dark" href="https://wa.me/${esc(c.whatsapp.replace(/\D/g, ''))}" target="_blank" rel="noopener">${icon('chat', 15)} WhatsApp</a>` : ''}${c.telegram ? `<a class="chip chip--dark" href="https://t.me/${esc(c.telegram)}" target="_blank" rel="noopener">${icon('send', 15)} Telegram</a>` : ''}</div></div>
      <div><h4>FARABI</h4>${Object.entries(SECTIONS).map(([k, s]) => `<a href="#/${k}">${esc(s.brand)}</a>`).join('')}</div>
      <div><h4>${T('nav_business')}</h4><a href="#/business">${T('proposeCoop')}</a><a href="#/business?s=partner">${T('becomePartner')}</a><a href="#/search?commercial=1">${T('h_commercial')}</a><a href="#/about">${T('nav_about')}</a></div>
      <div><h4>${T('nav_contacts')}</h4><span>${esc(L(c.address))}</span><a href="tel:${esc(c.phone.replace(/[^+\d]/g, ''))}">${esc(c.phone)}</a><a href="mailto:${esc(c.email)}">${esc(c.email)}</a></div>
    </div>
    <div class="container footer__bottom"><span>© ${new Date().getFullYear()} ${T('footerRights')}</span><a href="#/admin">${icon('lock', 14)} ${T('admin')}</a></div>`;
  },

  closeMenu() { document.body.classList.remove('menu-open'); },

  reveal() {
    if (!('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -40px 0px' });
    const els = $$('.block, .rail, .question, .cta, .scenario').filter(el => el.getBoundingClientRect().top > window.innerHeight);
    els.forEach(el => { el.classList.add('reveal'); io.observe(el); });
    // safety net: never leave content hidden if the observer does not fire (background tabs, print, etc.)
    clearTimeout(this._revealT);
    this._revealT = setTimeout(() => els.forEach(el => el.classList.add('in')), 2500);
  },

  bind() {
    window.addEventListener('hashchange', () => this.route());
    window.addEventListener('scroll', () => $('#header').classList.toggle('scrolled', window.scrollY > 8), { passive: true });

    document.addEventListener('submit', e => {
      const f = e.target;
      if (f.matches('[data-search]')) { e.preventDefault(); location.hash = '#/search?q=' + encodeURIComponent(f.q.value.trim()); }
      if (f.matches('[data-catalog-search]')) { e.preventDefault(); CatalogState.q = f.q.value.trim(); renderGrid(); }
      if (f.id === 'reqForm') { e.preventDefault(); submitRequest(f); }
    });

    document.addEventListener('input', e => {
      const t = e.target;
      if (t.closest('[data-catalog-search]') && CatalogState) { clearTimeout(this._deb); this._deb = setTimeout(() => { CatalogState.q = t.value.trim(); renderGrid(); }, 180); }
    });

    document.addEventListener('change', e => {
      const t = e.target;
      if (!CatalogState) { if (t.type === 'file' && t.closest('.file')) t.closest('.file').querySelector('.file__name').textContent = t.files[0] ? t.files[0].name : ''; return; }
      if (t.dataset.filter) { CatalogState.f[t.dataset.filter] = t.value; renderGrid(); }
      if (t.dataset.opt) { t.checked ? CatalogState.opts.add(t.dataset.opt) : CatalogState.opts.delete(t.dataset.opt); renderGrid(); }
      if (t.matches('[data-sort]')) { CatalogState.sort = t.value; renderGrid(); }
    });

    document.addEventListener('click', e => {
      const t = e.target;
      const lang = t.closest('[data-lang]');
      if (lang) { setLang(lang.dataset.lang); this._keepScroll = true; this.route(); return; }

      if (t.closest('[data-close]')) { Modal.close(); return; }
      if (t.closest('#burger')) { document.body.classList.toggle('menu-open'); return; }
      if (t.closest('#searchToggle')) { location.hash = '#/search'; setTimeout(() => { const i = $('.hero-search input'); i && i.focus(); }, 60); return; }
      if (t.closest('#nav a')) this.closeMenu();

      const req = t.closest('[data-request]');
      if (req) { e.preventDefault(); openRequest(JSON.parse(req.dataset.request)); return; }

      const sc = t.closest('[data-scenario]');
      if (sc) { const sel = $('#bizFormWrap select[name="scenario"]'); if (sel) { sel.value = sc.dataset.scenario; $$('.scenario').forEach(s => s.classList.toggle('active', s === sc)); $('#bizFormWrap').scrollIntoView({ behavior: 'smooth', block: 'start' }); } return; }

      const chip = t.closest('[data-chip]');
      if (chip && CatalogState) { CatalogState.chip = chip.dataset.chip; $$('[data-chip]').forEach(c => c.classList.toggle('active', c === chip)); renderGrid(); return; }

      if (t.closest('[data-filters-reset]') && CatalogState) {
        CatalogState.f = {}; CatalogState.opts.clear(); CatalogState.chip = ''; CatalogState.q = ''; CatalogState.commercial = false;
        $$('[data-filter]').forEach(s => { s.value = ''; }); $$('[data-opt]').forEach(c => { c.checked = false; });
        $$('[data-chip]').forEach(c => c.classList.toggle('active', !c.dataset.chip)); const q = $('[data-catalog-search] input'); if (q) q.value = '';
        renderGrid(); return;
      }
      if (t.closest('[data-filters-open]')) { document.body.classList.add('filters-open'); return; }
      if (t.closest('[data-filters-close]')) { document.body.classList.remove('filters-open'); return; }

      const rl = t.closest('[data-rail]');
      if (rl) { const tr = rl.closest('.rail').querySelector('.rail__track'); tr.scrollBy({ left: Number(rl.dataset.rail) * tr.clientWidth * 0.8, behavior: 'smooth' }); return; }

      const g = t.closest('[data-gal]');
      if (g) {
        $$('.gallery__thumb').forEach(x => x.classList.toggle('active', x === g));
        const main = $('#galMain');
        const { parts } = this.parse(); const it = Store.get(parts[0], parts[1]);
        if (g.dataset.gal === 'video') main.innerHTML = it && it.video && /^https?:/.test(it.video)
          ? `<video src="${esc(it.video)}" controls autoplay></video>`
          : `<div class="video-ph">${icon('play', 48)}<span>${L({ ru: 'Демонстрационное видео', kz: 'Демонстрациялық бейне', en: 'Demo video' })}</span></div>`;
        else main.innerHTML = art(it, parts[0], Number(g.dataset.gal));
        return;
      }

      if (t.closest('[data-share]')) {
        const url = location.href;
        if (navigator.share) navigator.share({ title: document.title, url }).catch(() => {});
        else if (navigator.clipboard) navigator.clipboard.writeText(url).then(() => toast(T('copied')));
        return;
      }

      const mp = t.closest('[data-mp]');
      if (mp) { Store.trackClick(mp.dataset.type, mp.dataset.id, mp.dataset.mp); }
      const tr = t.closest('[data-track]');
      if (tr) { Store.trackClick(tr.dataset.type, tr.dataset.id, tr.dataset.track); }
    });

    document.addEventListener('keydown', e => { if (e.key === 'Escape') { Modal.close(); document.body.classList.remove('filters-open'); this.closeMenu(); } });
  }
};

applyCustomCategories();
setLang(LANG);
Admin.bind();
App.bind();
App.route();
