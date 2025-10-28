document.addEventListener('DOMContentLoaded', () => {
  // Mobile nav toggle
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      nav.classList.toggle('open');
    });
  }

  // Shared URL normalizer for all dynamic sections
  function normalizeUrl(val) {
    if (!val) return '';
    let u = String(val).trim();
    try { new URL(u); return u; } catch {}
    if (/^[a-zA-Z0-9.-]+(\:[0-9]+)?(\/.*)?$/.test(u)) return `https://${u}`;
    return u;
  }

  // ---- Research Highlights (Dynamic table from Google Sheets CSV) ----
  const RH_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRNcWHehNKWKIGongMlyzuKASbYE167a5GFBRugMVT9fxOn4PdpHJFtZD-bulTZgw2etgA3crsR-J3j/pub?gid=0&single=true&output=csv';
  const rhList = document.getElementById('research-list');
  if (rhList) {
    const toText = async (res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.text();
    };
    const parseCSV = (text) => {
      const rows = [];
      let i = 0, cur = '', row = [], inQuotes = false;
      while (i < text.length) {
        const char = text[i];
        if (inQuotes) {
          if (char === '"' && text[i + 1] === '"') { cur += '"'; i += 2; continue; }
          if (char === '"') { inQuotes = false; i++; continue; }
          cur += char; i++; continue;
        } else {
          if (char === '"') { inQuotes = true; i++; continue; }
          if (char === ',') { row.push(cur.trim()); cur = ''; i++; continue; }
          if (char === '\n') { row.push(cur.trim()); rows.push(row); row = []; cur = ''; i++; continue; }
          cur += char; i++; continue;
        }
      }
      if (cur.length || row.length) { row.push(cur.trim()); rows.push(row); }
      return rows;
    };
    const normalizeUrl = (val) => {
      if (!val) return '';
      let u = String(val).trim();
      try { new URL(u); return u; } catch {}
      if (/^[a-zA-Z0-9.-]+(\:[0-9]+)?(\/.*)?$/.test(u)) return `https://${u}`;
      return u;
    };
    const toObjects = (rows) => {
      if (!rows || rows.length === 0) return [];
      const headers = rows[0].map(h => h.trim());
      const items = [];
      for (let r = 1; r < rows.length; r++) {
        const row = rows[r];
        if (row.every(v => v.trim() === '')) continue;
        const obj = {};
        headers.forEach((h, idx) => {
          const key = h.toLowerCase().replace(/\s+/g,'');
          obj[key] = (row[idx] || '').trim();
          obj[h] = obj[key];
        });
        items.push(obj);
      }
      return items;
    };
    const renderRH = (items) => {
      rhList.innerHTML = '';
      const frag = document.createDocumentFragment();
      items.forEach(it => {
        const li = document.createElement('li');
        li.className = 'rh-item';

        const left = document.createElement('div');
        left.className = 'rh-left';
        left.textContent = it.progress || it.Progress || '';

        const right = document.createElement('div');
        right.className = 'rh-right';
        const title = document.createElement('div');
        title.className = 'rh-title';
        title.textContent = it.title || it.Title || '';
        const desc = document.createElement('div');
        desc.className = 'rh-desc';
        desc.textContent = it.description || it.Description || '';
        const href = normalizeUrl(it.url || it.URL || it.link || it.Link || '');
        const linkWrap = document.createElement('div');
        linkWrap.className = 'rh-link';
        if (href) {
          const a = document.createElement('a');
          a.href = href;
          a.target = '_blank';
          a.rel = 'noopener';
          const icon = document.createElement('i');
          icon.className = 'fa-solid fa-arrow-up-right-from-square';
          icon.setAttribute('aria-hidden', 'true');
          a.appendChild(icon);
          linkWrap.appendChild(a);
        }

        right.appendChild(title);
        if (desc.textContent) right.appendChild(desc);
        if (linkWrap.childNodes.length) right.appendChild(linkWrap);

        li.appendChild(left);
        li.appendChild(right);
        frag.appendChild(li);
      });
      rhList.appendChild(frag);
    };
    (async () => {
      try {
        const text = await fetch(RH_CSV_URL, { cache: 'no-store' }).then(toText);
        const rows = parseCSV(text);
        const items = toObjects(rows);
        if (items.length) renderRH(items);
      } catch (e) {
        console.warn('Research highlights load failed:', e);
      }
    })();
  }

  // Header shadow on scroll
  const header = document.querySelector('.site-header');
  const onScroll = () => {
    if (!header) return;
    if (window.scrollY > 8) header.classList.add('header-shadow');
    else header.classList.remove('header-shadow');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---- Career & Seminar Highlights (two-column lists) ----
  const CAREER_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ0MsyDtUKrbhvm2r6z02zqGjutd9NRo80pp-xmCJHi8trlsBvoTAq8D3rW15hVdVfX7aknatUay1-w/pub?gid=0&single=true&output=csv';
  const SEMINAR_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSXK2i7ZxFHOTPItBS0hEpCoWM0XeoJMGS_OH1-X0690VqLtAg_lmeZuVQx-2ZR8UjoROZR1VE1chT7/pub?gid=0&single=true&output=csv';

  const careerList = document.getElementById('career-list');
  const seminarList = document.getElementById('seminar-list');
  const careerEmpty = document.getElementById('career-empty');
  const seminarEmpty = document.getElementById('seminar-empty');

  const csvFetchText = async (url) => {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.text();
  };
  const csvParse = (text) => {
    const rows = [];
    let i = 0, cur = '', row = [], inQuotes = false;
    // Normalize newlines
    const src = text.replace(/\r\n?/g, '\n');
    while (i < src.length) {
      const ch = src[i];
      if (inQuotes) {
        if (ch === '"' && src[i + 1] === '"') { cur += '"'; i += 2; continue; }
        if (ch === '"') { inQuotes = false; i++; continue; }
        cur += ch; i++; continue;
      } else {
        if (ch === '"') { inQuotes = true; i++; continue; }
        if (ch === ',') { row.push(cur.trim()); cur = ''; i++; continue; }
        if (ch === '\n') { row.push(cur.trim()); rows.push(row); row = []; cur = ''; i++; continue; }
        cur += ch; i++; continue;
      }
    }
    if (cur.length || row.length) { row.push(cur.trim()); rows.push(row); }
    return rows;
  };
  const csvToObjects = (rows) => {
    if (!rows || rows.length === 0) return [];
    // Find first non-empty row as header
    let headerIndex = 0;
    while (headerIndex < rows.length && rows[headerIndex].every(v => (v || '').trim() === '')) {
      headerIndex++;
    }
    if (headerIndex >= rows.length) return [];
    const headers = rows[headerIndex].map(h => (h || '').trim());
    const items = [];
    for (let r = headerIndex + 1; r < rows.length; r++) {
      const row = rows[r] || [];
      // Skip rows that are fully empty
      if (row.every(v => (v || '').trim() === '')) continue;
      const obj = {};
      headers.forEach((h, idx) => {
        const key = h.toLowerCase().replace(/\s+/g,'');
        const cell = (row[idx] !== undefined ? row[idx] : '').trim();
        obj[key] = cell;
        obj[h] = cell;
      });
      items.push(obj);
    }
    return items;
  };

  const renderSimpleList = (items, ulEl, emptyEl) => {
    if (!ulEl) return;
    ulEl.innerHTML = '';
    if (!items || items.length === 0) {
      if (emptyEl) emptyEl.hidden = false;
      return;
    }
    if (emptyEl) emptyEl.hidden = true;
    const frag = document.createDocumentFragment();

    // Heuristically pick the best keys for time/news
    const pickKey = (keys, candidates) => {
      const set = new Set(keys.map(k => k.toLowerCase()));
      for (const c of candidates) if (set.has(c)) return c;
      // fuzzy contains
      for (const c of candidates) {
        const hit = keys.find(k => k.toLowerCase().includes(c));
        if (hit) return hit;
      }
      return '';
    };
    const keys = Object.keys(items[0] || {});
    // prefer explicit time keys; else detect month/year combo
    let timeKey = pickKey(keys, ['time','date','when','progress','timeline']);
    const monthKey = pickKey(keys, ['month']);
    const yearKey = pickKey(keys, ['year']);
    // prefer explicit news-like keys
    let newsKey = pickKey(keys, ['news','title','event','headline','item','text']);

    items.forEach(it => {
      const li = document.createElement('li');
      li.className = 'rh-item';

      const left = document.createElement('div');
      left.className = 'rh-left';
      let timeVal = '';
      if (timeKey && it[timeKey] !== undefined) timeVal = it[timeKey];
      else if (it.time || it.Time) timeVal = it.time || it.Time;
      else if (monthKey || yearKey) {
        const m = (it[monthKey] || '').toString().trim();
        const y = (it[yearKey] || '').toString().trim();
        timeVal = [m, y].filter(Boolean).join(' ');
      } else {
        timeVal = it.progress || it.date || it.when || it.Progress || '';
      }
      left.textContent = timeVal;

      const right = document.createElement('div');
      right.className = 'rh-right';
      const title = document.createElement('div');
      title.className = 'rh-title';
      let newsText = '';
      if (newsKey && it[newsKey] !== undefined) newsText = it[newsKey];
      else newsText = it.news || it.News || it.title || it.event || it.Title || '';
      title.textContent = newsText;
      const desc = document.createElement('div');
      desc.className = 'rh-desc';
      desc.textContent = it.description || it.details || it.Description || '';
      const href = normalizeUrl(
        it.url || it.URL || it.link || it.Link || it.website || it.websiteurl || it.weblink || ''
      );
      const linkWrap = document.createElement('div');
      linkWrap.className = 'rh-link';
      if (href) {
        const a = document.createElement('a');
        a.href = href;
        a.target = '_blank';
        a.rel = 'noopener';
        const icon = document.createElement('i');
        icon.className = 'fa-solid fa-arrow-up-right-from-square';
        icon.setAttribute('aria-hidden', 'true');
        a.appendChild(icon);
        linkWrap.appendChild(a);
      }

      right.appendChild(title);
      if (desc.textContent) right.appendChild(desc);
      if (linkWrap.childNodes.length) right.appendChild(linkWrap);

      li.appendChild(left);
      li.appendChild(right);
      frag.appendChild(li);
    });
    ulEl.appendChild(frag);
  };

  (async () => {
    try {
      if (careerList) {
        const text = await csvFetchText(CAREER_CSV_URL);
        const rows = csvParse(text);
        const items = csvToObjects(rows);
        console.log('[Career] rows:', rows.length, 'items:', items.slice(0,3));
        renderSimpleList(items, careerList, careerEmpty);
      }
    } catch (e) {
      console.warn('Career highlights load failed:', e);
      if (careerEmpty) careerEmpty.hidden = false;
    }
  })();

  (async () => {
    try {
      if (seminarList) {
        const text = await csvFetchText(SEMINAR_CSV_URL);
        const rows = csvParse(text);
        const items = csvToObjects(rows);
        console.log('[Seminar] rows:', rows.length, 'items:', items.slice(0,3));
        renderSimpleList(items, seminarList, seminarEmpty);
      }
    } catch (e) {
      console.warn('Seminar highlights load failed:', e);
      if (seminarEmpty) seminarEmpty.hidden = false;
    }
  })();

  // Smooth scroll for internal links
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (!targetId) return;
      const el = document.querySelector(targetId);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.pushState(null, '', targetId);
      }
    });
  });

  // Dynamic year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Fresh simple image viewer
  const viewer = document.getElementById('img-viewer');
  const viewerImg = viewer ? viewer.querySelector('.img-viewer-img') : null;
  const viewerClose = viewer ? viewer.querySelector('.img-viewer-close') : null;
  const viewerBackdrop = viewer ? viewer.querySelector('.img-viewer-backdrop') : null;
  const openViewer = (src, alt = '') => {
    if (!viewer || !viewerImg) return;
    // Use high-res if provided
    viewerImg.src = src;
    viewerImg.alt = alt || 'Full size preview';
    viewer.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
  };
  const closeViewer = () => {
    if (!viewer || !viewerImg) return;
    viewer.setAttribute('hidden', '');
    // Clear src to free memory on mobile
    viewerImg.removeAttribute('src');
    document.body.style.overflow = '';
  };
  document.querySelectorAll('.lightboxable').forEach(img => {
    img.addEventListener('click', () => {
      const full = img.getAttribute('data-fullsrc') || img.src;
      openViewer(full, img.alt);
    });
    img.style.cursor = 'zoom-in';
  });
  if (viewerClose) viewerClose.addEventListener('click', closeViewer);
  if (viewerBackdrop) viewerBackdrop.addEventListener('click', closeViewer);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeViewer();
  });

  // ---- Avengers grid pagination (4 per page) ----
  (function initAvengersPagination(){
    const grid = document.getElementById('avengers-container');
    const pager = document.getElementById('avengers-pagination');
    if (!grid || !pager) return;

    const PAGE_SIZE = 4;
    let current = 0; // page index

    const getTiles = () => Array.from(grid.children).filter(n => n.nodeType === 1);
    const pageCount = () => Math.max(1, Math.ceil(getTiles().length / PAGE_SIZE));

    const renderPager = () => {
      const total = pageCount();
      pager.innerHTML = '';
      const prev = document.createElement('button');
      prev.textContent = 'Prev';
      prev.disabled = current <= 0;
      prev.addEventListener('click', () => { if (current>0){ current--; applyPage(); }});
      const next = document.createElement('button');
      next.textContent = 'Next';
      next.disabled = current >= total - 1;
      next.addEventListener('click', () => { if (current<total-1){ current++; applyPage(); }});
      pager.appendChild(prev);
      for (let i=0;i<total;i++){
        const dot = document.createElement('span');
        dot.className = 'page-dot' + (i===current ? ' active' : '');
        dot.addEventListener('click', () => { current = i; applyPage(); });
        pager.appendChild(dot);
      }
      pager.appendChild(next);
    };

    const applyPage = () => {
      const tiles = getTiles();
      const start = current * PAGE_SIZE;
      const end = start + PAGE_SIZE;
      tiles.forEach((el, idx) => {
        el.style.display = (idx >= start && idx < end) ? '' : 'none';
      });
      // Clamp current if items changed
      const total = pageCount();
      if (current > total - 1) current = total - 1;
      renderPager();
    };

    // Observe changes to rebuild pagination when tiles are injected dynamically
    const mo = new MutationObserver(() => {
      // Reset to first page when data refreshes
      current = 0;
      applyPage();
    });
    mo.observe(grid, { childList: true });

    // Initial apply (if tiles already present)
    applyPage();
  })();

  // ---- Work Experience (Dynamic from Google Sheets CSV) ----
  // 1) In Google Sheets: File → Share → Publish to web → select the sheet → CSV
  // 2) Paste the published CSV link below
  const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSyNMghfKkIzRl_NU3saSeM2TXaFtuUyhcUmXgUKQbEmDRsQrQh-83OwJ0p6MYDQACdglLsDfgevgIr/pub?gid=0&single=true&output=csv';

  const workGrid = document.getElementById('work-grid');
  if (workGrid) {
    const getFirst = (obj, keys) => {
      for (const k of keys) {
        if (obj[k]) return obj[k];
      }
      return '';
    };
    const normalizeUrl = (val) => {
      if (!val) return '';
      let u = String(val).trim();
      // If it already parses as an absolute URL, keep it
      try { new URL(u); return u; } catch {/*not absolute*/}
      // If it's like 'example.com/path', prepend https://
      if (/^[a-zA-Z0-9.-]+(\:[0-9]+)?(\/.*)?$/.test(u)) {
        return `https://${u}`;
      }
      // Fallback: just return original trimmed
      return u;
    };
    const toText = async (res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.text();
    };
    const parseCSV = (text) => {
      // Simple CSV parser supporting quoted fields
      const rows = [];
      let i = 0, cur = '', row = [], inQuotes = false;
      while (i < text.length) {
        const char = text[i];
        if (inQuotes) {
          if (char === '"' && text[i + 1] === '"') { cur += '"'; i += 2; continue; }
          if (char === '"') { inQuotes = false; i++; continue; }
          cur += char; i++; continue;
        } else {
          if (char === '"') { inQuotes = true; i++; continue; }
          if (char === ',') { row.push(cur.trim()); cur = ''; i++; continue; }
          if (char === '\n') { row.push(cur.trim()); rows.push(row); row = []; cur = ''; i++; continue; }
          cur += char; i++; continue;
        }
      }
      if (cur.length || row.length) { row.push(cur.trim()); rows.push(row); }
      return rows;
    };

    const toFavicon = (siteUrl, size = 64) => {
      try {
        if (!siteUrl || siteUrl === '#') return '';
        const u = new URL(siteUrl);
        // Try Google favicon service for better availability
        return `https://www.google.com/s2/favicons?domain=${u.hostname}&sz=${size}`;
      } catch { return ''; }
    };
    const driveToDirect = (url) => {
      if (!url) return '';
      // Patterns: /file/d/<id>/view, open?id=<id>
      try {
        const u = new URL(url);
        if (u.hostname.includes('drive.google.com')) {
          // /file/d/<id>/view
          const m = u.pathname.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
          if (m && m[1]) return `https://drive.google.com/uc?export=view&id=${m[1]}`;
          // open?id=<id>
          const id = u.searchParams.get('id');
          if (id) return `https://drive.google.com/uc?export=view&id=${id}`;
        }
        return url;
      } catch { return url; }
    };
    const pickLogo = (obj) => {
      // 1) Direct known keys
      const known = ['logourl','logo','employerlogo','image','imageurl','companylogo','companylogourl'];
      for (const k of known) { if (obj[k]) return driveToDirect(obj[k]); }
      // 2) A column that contains a Google Drive ID only
      const idKeys = ['logoid','driveid','googleid'];
      for (const k of idKeys) { if (obj[k]) return driveToDirect(`https://drive.google.com/uc?export=view&id=${obj[k]}`); }
      // 3) Heuristic: find first column whose name includes 'logo' or 'image'
      for (const key of Object.keys(obj)) {
        const nk = key.toLowerCase();
        if ((nk.includes('logo') || nk.includes('image')) && obj[key]) return driveToDirect(obj[key]);
      }
      return '';
    };

    const renderWork = (items) => {
      workGrid.innerHTML = '';
      const frag = document.createDocumentFragment();
      items.forEach(item => {
        const card = document.createElement('article');
        card.className = 'work-card';

        const top = document.createElement('div');
        top.className = 'work-top';

        const logo = document.createElement('img');
        logo.className = 'work-logo';
        logo.alt = 'Employer logo';
        const employerUrlNorm = normalizeUrl(getFirst(item, [
          'employerurl','website','site','url','weblink','homepage','companyurl','organizationurl','EmployerURL'
        ]));
        const logoSrc = pickLogo(item) || toFavicon(employerUrlNorm);
        logo.src = logoSrc || 'images/SecondaryLogo_Color2.avif';
        // Fallback to favicon if logo fails
        logo.addEventListener('error', () => {
          const fav = toFavicon(employerUrlNorm, 128);
          if (fav && logo.src !== fav) logo.src = fav; // swap once
        });

        const name = document.createElement('h3');
        name.className = 'work-name';
        const a = document.createElement('a');
        a.target = '_blank';
        a.rel = 'noopener';
        a.textContent = item.employer || item.Employer || getFirst(item, ['company','organization','employername']) || 'Employer';
        const employerUrl = employerUrlNorm;
        a.href = employerUrl || '#';
        name.appendChild(a);

        top.appendChild(logo);
        top.appendChild(name);

        const role = document.createElement('div');
        role.className = 'work-role';
        role.textContent = item.designation || item.Designation || '';

        const links = document.createElement('div');
        links.className = 'work-links';
        // Prefer the 'Work Portfolio' column first (normalized: workportfolio)
        const portfolioUrlRaw = getFirst(item, [
          'workportfolio', // exact requested column
          'portfoliourl','portfolio','portfolio url','portfolio link','portfoliolink','PortfolioURL'
        ]) || employerUrl;
        const portfolioUrl = normalizeUrl(portfolioUrlRaw);
        if (portfolioUrl) {
          const pa = document.createElement('a');
          pa.href = portfolioUrl;
          pa.target = '_blank';
          pa.rel = 'noopener';
          pa.className = 'portfolio-tag';
          pa.textContent = 'Portfolio';
          links.appendChild(pa);
        }

        const meta = document.createElement('div');
        meta.className = 'work-meta';
        if (item.duration || item.Duration) {
          const tag = document.createElement('span');
          tag.className = 'duration-tag';
          tag.textContent = item.duration || item.Duration;
          meta.appendChild(tag);
        }

        card.appendChild(top);
        card.appendChild(role);
        card.appendChild(links);
        card.appendChild(meta);
        frag.appendChild(card);
      });
      workGrid.appendChild(frag);
    };

    const toObjects = (rows) => {
      if (!rows || rows.length === 0) return [];
      const headers = rows[0].map(h => h.trim());
      const items = [];
      for (let r = 1; r < rows.length; r++) {
        const row = rows[r];
        if (row.every(v => v.trim() === '')) continue; // skip empty rows
        const obj = {};
        headers.forEach((h, idx) => {
          const key = h.toLowerCase().replace(/\s+/g,'');
          obj[key] = (row[idx] || '').trim();
          // Also keep original-cased key for backward compatibility
          obj[h] = obj[key];
        });
        items.push(obj);
      }
      return items; // first data row is kept first
    };

    const initWork = async () => {
      if (!SHEET_CSV_URL) return; // not configured
      try {
        const text = await fetch(SHEET_CSV_URL, { cache: 'no-store' }).then(toText);
        const rows = parseCSV(text);
        const items = toObjects(rows);
        if (items.length) renderWork(items);
      } catch (err) {
        console.warn('Work grid load failed:', err);
      }
    };

    initWork();
  }
})
;
