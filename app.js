(function () {
  'use strict';

  const PAGE = 24;
  const SHEET_CSV = 'https://docs.google.com/spreadsheets/d/1gvSuKOJV9yhQauLXgwOgxfuhmj1j6cGUp8B2hGkKuuM/gviz/tq?tqx=out:csv';
  const SHORT = {
    'Learning, Courses & Books': 'Learning',
    'Video, Audio & 3D AI': 'Video & Audio',
    'Design, Photo & Visuals': 'Design',
    'AI Assistants & Writing': 'AI & Writing',
    'Research & Academic': 'Research',
    'PDF & File Utilities': 'PDF & Files',
    'Productivity & Focus': 'Productivity',
    'Business, Life & Web Gems': 'Web Gems',
    'Career, Jobs & Resumes': 'Careers',
    'Interactive Fun & Games': 'Fun',
    'Exam Prep & Current Affairs': 'Exam Prep',
    'Coding & Tech Skills': 'Coding'
  };

  const state = { items: (window.VAULT || []).slice(), tab: 'all', cat: 'all', q: '', shown: PAGE };
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const safeUrl = (u) => (/^https?:\/\//i.test(u || '') ? u : '#');

  /* ---------- Theme ---------- */
  $('themeBtn').addEventListener('click', () => {
    const root = document.documentElement;
    const current = root.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const next = current === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('nb_theme', next); } catch (e) {}
  });

  /* ---------- Toast & copy ---------- */
  let toastTimer;
  function toast(msg) {
    const t = $('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2000);
  }
  function copy(text) {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => toast('Copied to clipboard'), () => fallback());
    } else fallback();
    function fallback() {
      const ta = document.createElement('textarea');
      ta.value = text; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); toast('Copied to clipboard'); } catch (e) { toast('Select the text and copy it manually'); }
      ta.remove();
    }
  }

  /* ---------- Filtering ---------- */
  function filtered() {
    const q = state.q.trim().toLowerCase();
    const reel = q.match(/^#?(\d{1,4})$/);
    let list = state.items.filter((x) => {
      if (state.tab !== 'all' && x.type !== state.tab) return false;
      if (state.cat !== 'all' && x.category !== state.cat) return false;
      if (!q) return true;
      if (reel) return x.igNumber === Number(reel[1]);
      return [x.title, x.description, x.domain, x.category, x.model, (x.tags || []).join(' ')].join(' ').toLowerCase().includes(q);
    });
    const rank = (x) => (x.pinned ? 3 : x.type === 'prompt' ? 2 : x.type === 'tutorial' ? 1 : 0);
    return list.sort((a, b) => rank(b) - rank(a) || (a.igNumber || 9999) - (b.igNumber || 9999));
  }

  function card(x) {
    const cat = SHORT[x.category] || x.category || '';
    const reel = x.igNumber ? `<span class="reel">Reel #${x.igNumber}</span>` : '';
    if (x.type === 'prompt') {
      return `<button type="button" class="card is-prompt" data-prompt="${esc(x.id)}">
        <div class="card-top"><span>Prompt · ${esc(x.model || 'Any AI')}</span>${reel}</div>
        <h3>${esc(x.title)}</h3>
        <p>${esc(x.description)}</p>
        <div class="card-foot"><span>${esc(cat)}</span><span class="go">Open prompt →</span></div>
      </button>`;
    }
    const label = x.type === 'tutorial' ? 'Watch ↗' : 'Visit ↗';
    return `<a class="card" href="${esc(safeUrl(x.url))}" target="_blank" rel="noopener">
      <div class="card-top"><span>${esc(x.type === 'tutorial' ? 'Tutorial' : cat)}</span>${reel}</div>
      <h3>${esc(x.title)}</h3>
      <p>${esc(x.description)}</p>
      <div class="card-foot"><span>${esc(x.domain || '')}</span><span class="go">${label}</span></div>
    </a>`;
  }

  function renderChips() {
    const counts = {};
    state.items.forEach((x) => { if (state.tab === 'all' || x.type === state.tab) counts[x.category] = (counts[x.category] || 0) + 1; });
    const cats = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
    if (state.cat !== 'all' && !counts[state.cat]) state.cat = 'all';
    $('chips').innerHTML = [`<button type="button" class="chip" data-cat="all" aria-pressed="${state.cat === 'all'}">All topics</button>`]
      .concat(cats.map((c) => `<button type="button" class="chip" data-cat="${esc(c)}" aria-pressed="${state.cat === c}">${esc(SHORT[c] || c)}</button>`))
      .join('');
  }

  function render() {
    document.querySelectorAll('.tabs button').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tab === state.tab)));
    renderChips();
    const list = filtered();
    const shown = list.slice(0, state.shown);
    $('grid').innerHTML = shown.map(card).join('');
    $('empty').hidden = list.length > 0;
    $('moreBtn').parentElement.hidden = shown.length >= list.length;
    $('count').textContent = list.length
      ? `Showing ${shown.length} of ${list.length}`
      : '';
    $('statTotal').textContent = state.items.length;
  }

  /* ---------- Events ---------- */
  document.querySelector('.tabs').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-tab]'); if (!b) return;
    state.tab = b.dataset.tab; state.shown = PAGE; render();
  });
  $('chips').addEventListener('click', (e) => {
    const b = e.target.closest('.chip'); if (!b) return;
    state.cat = b.dataset.cat; state.shown = PAGE; render();
  });
  let qTimer;
  $('search').addEventListener('input', (e) => {
    clearTimeout(qTimer);
    qTimer = setTimeout(() => { state.q = e.target.value; state.shown = PAGE; render(); }, 120);
  });
  $('moreBtn').addEventListener('click', () => { state.shown += PAGE; render(); });
  $('resetBtn').addEventListener('click', () => {
    state.tab = 'all'; state.cat = 'all'; state.q = ''; state.shown = PAGE; $('search').value = ''; render();
  });
  document.querySelectorAll('[data-jump]').forEach((a) => a.addEventListener('click', () => {
    state.tab = a.dataset.jump; state.cat = 'all'; state.shown = PAGE; render();
  }));
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && !/input|textarea/i.test(document.activeElement.tagName)) {
      e.preventDefault(); $('search').focus();
    }
  });

  /* ---------- Prompt dialog ---------- */
  let baseText = '';
  $('grid').addEventListener('click', (e) => {
    const b = e.target.closest('[data-prompt]'); if (!b) return;
    const x = state.items.find((i) => i.id === b.dataset.prompt); if (!x) return;
    baseText = x.promptText || '';
    $('pdModel').textContent = x.model || 'AI prompt';
    $('pdTitle').textContent = x.title;
    $('pdDesc').textContent = x.description || '';
    $('pdText').value = baseText;
    const tokens = Array.from(new Set(baseText.match(/\[[^\[\]\n]{2,48}\]/g) || []));
    const vars = $('pdVars');
    vars.hidden = tokens.length === 0;
    vars.innerHTML = tokens.map((t) => `<label>${esc(t.slice(1, -1))}<input data-token="${esc(t)}" placeholder="${esc(t.slice(1, -1))}" /></label>`).join('');
    $('promptDialog').showModal();
  });
  $('pdVars').addEventListener('input', () => {
    let txt = baseText;
    $('pdVars').querySelectorAll('input').forEach((inp) => {
      const v = inp.value.trim();
      if (v) txt = txt.split(inp.dataset.token).join(v);
    });
    $('pdText').value = txt;
  });
  $('pdCopy').addEventListener('click', () => copy($('pdText').value));
  $('promptDialog').addEventListener('click', (e) => { if (e.target === e.currentTarget) e.currentTarget.close(); });

  /* ---------- Live Google Sheet sync (new rows appear automatically) ---------- */
  function parseCSV(text) {
    const rows = []; let row = [], cur = '', q = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i], n = text[i + 1];
      if (q) {
        if (c === '"' && n === '"') { cur += '"'; i++; } else if (c === '"') q = false; else cur += c;
      } else if (c === '"') q = true;
      else if (c === ',') { row.push(cur); cur = ''; }
      else if (c === '\n' || c === '\r') { if (c === '\r' && n === '\n') i++; row.push(cur); rows.push(row); row = []; cur = ''; }
      else cur += c;
    }
    if (cur || row.length) { row.push(cur); rows.push(row); }
    return rows;
  }
  const norm = (u) => (u || '').toLowerCase().replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
  fetch(SHEET_CSV).then((r) => (r.ok ? r.text() : '')).then((csv) => {
    if (!csv) return;
    const seen = new Set(state.items.map((x) => norm(x.url)).filter(Boolean));
    let added = 0;
    parseCSV(csv).slice(1).forEach((r, i) => {
      const title = (r[0] || '').trim(), desc = (r[1] || '').trim();
      let u = (r[2] || '').trim();
      if (!title || !u || !u.includes('.') || /not in caption/i.test(u)) return;
      if (!/^https?:\/\//i.test(u)) u = 'https://' + u;
      const n = norm(u); if (seen.has(n)) return; seen.add(n);
      state.items.unshift({ id: 'sheet-' + i, type: 'website', igNumber: null, title, url: u, domain: n.split('/')[0],
        category: 'Business, Life & Web Gems', tags: ['New'], pricing: /free/i.test(desc) ? 'Free' : 'Freemium', description: desc || title });
      added++;
    });
    if (added) render();
  }).catch(() => {});

  /* ---------- Vibe coded: Nishkam's AI tool library ---------- */
  const projects = window.PROJECTS || [];
  if (!projects.length) $('projects').hidden = true;
  const ICONS = {
    pdf: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>',
    photo: '<circle cx="12" cy="9" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
    idcard: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2"/><path d="M6 16c.6-1.4 1.7-2 3-2s2.4.6 3 2M14 10h4M14 13h3"/>',
    resume: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>',
    captions: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 15h4M14 15h3M7 11h3M13 11h4"/>',
    clips: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.1 15.9M14.5 14.5 20 20M8.1 8.1 12 12"/>',
    fonts: '<path d="M4 19 9 5l5 14M5.8 14h6.4"/><path d="M15 12.5c.6-1 1.6-1.5 2.8-1.5 1.8 0 2.7 1 2.7 2.6V19M20.5 15.6c-.8-.4-1.6-.6-2.6-.6-1.6 0-2.9.8-2.9 2.1S16 19 17.4 19c1.4 0 2.6-.7 3.1-1.9"/>',
    record: '<rect x="3" y="6" width="13" height="12" rx="2"/><path d="m16 10.5 5-3v9l-5-3"/>',
    avatar: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="10" r="3"/><path d="M6.2 18.5c1.2-2.2 3.3-3.5 5.8-3.5s4.6 1.3 5.8 3.5"/>',
    invoice: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6M9 16h3"/>',
    spark: '<path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z"/>',
  };
  const CAT_ICONS = {
    'All Tools': '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
    Productivity: '<path d="M12 3 3 8l9 5 9-5z"/><path d="m3 13 9 5 9-5"/>',
    Education: '<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c3 2 9 2 12 0v-5"/>',
    Design: '<path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.5-.8 1.2-1.6-.4-1 .2-2.4 1.6-2.4H17a4 4 0 0 0 4-4c0-5.5-4-10-9-10z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7" r="1"/><circle cx="15" cy="7.5" r="1"/>',
    Careers: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18"/>',
    Creators: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m10 9 5 3-5 3z"/>',
    Utilities: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z"/>',
  };
  const svg = (p) => `<svg viewBox="0 0 24 24" aria-hidden="true">${p}</svg>`;
  const ORDER = ['Productivity', 'Education', 'Design', 'Careers', 'Creators', 'Utilities'];
  const cats = ['All Tools', ...ORDER.filter((c) => projects.some((p) => (p.categories || []).includes(c)))];
  const lab = { cat: 'All Tools', q: '' };
  const toolName = (p) => p.name || p.title;

  $('labCount').textContent = projects.length;
  const feat = projects.find((p) => p.featured) || projects[0];
  if (feat) {
    $('labShot').src = feat.image;
    $('labShot').alt = 'Screenshot of ' + toolName(feat);
    $('labDevice').href = safeUrl(feat.url);
    $('labDevice').target = '_blank';
    $('labDevice').rel = 'noopener';
    $('labDevice').setAttribute('aria-label', 'Open ' + toolName(feat) + ' (featured tool)');
  }

  $('labCats').innerHTML = cats.map((c) =>
    `<button type="button" data-cat="${esc(c)}" aria-pressed="${c === lab.cat}">${svg(CAT_ICONS[c] || CAT_ICONS.Utilities)}${esc(c)}</button>`).join('');

  const toolCard = (p) => {
    const url = esc(safeUrl(p.url));
    const color = /^#[0-9a-f]{3,8}$/i.test(p.color || '') ? p.color : '#7c3aed';
    return `<article class="tool">
      <a class="tool-shot" href="${url}" target="_blank" rel="noopener" tabindex="-1" aria-hidden="true">
        <img src="${esc(p.image)}" alt="" loading="lazy" />${p.featured ? '<span class="tool-feat">Featured</span>' : ''}
      </a>
      <div class="tool-head">
        <span class="tool-icon" style="--c:${color}">${svg(ICONS[p.icon] || ICONS.spark)}</span>
        <h3>${esc(toolName(p))}</h3>
        <span class="tool-free">Free</span>
      </div>
      <p>${esc(p.description)}</p>
      <ul class="tool-chips">${(p.chips || p.tags || []).slice(0, 3).map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
      <a class="tool-cta" href="${url}" target="_blank" rel="noopener">Open Tool <span aria-hidden="true">↗</span><span class="sr-only"> ${esc(toolName(p))} (opens in a new tab)</span></a>
    </article>`;
  };

  const renderLab = () => {
    const q = lab.q.trim().toLowerCase();
    const list = projects.filter((p) =>
      (lab.cat === 'All Tools' || (p.categories || []).includes(lab.cat)) &&
      (!q || [p.name, p.title, p.description, ...(p.chips || []), ...(p.tags || []), ...(p.categories || [])].join(' ').toLowerCase().includes(q)));
    $('projectList').innerHTML = list.map(toolCard).join('');
    $('labEmpty').hidden = list.length > 0;
  };
  $('labCats').addEventListener('click', (e) => {
    const b = e.target.closest('[data-cat]');
    if (!b) return;
    lab.cat = b.dataset.cat;
    $('labCats').querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    renderLab();
  });
  $('labSearch').addEventListener('input', (e) => { lab.q = e.target.value; renderLab(); });
  renderLab();

  $('year').textContent = new Date().getFullYear();
  render();
})();
