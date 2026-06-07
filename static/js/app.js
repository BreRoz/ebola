// ── Boot sequence ──────────────────────────────────────────────────────
(function() {
  const lines = [
    { text: 'EBOLA TRACKER OS v2.6.0 — INITIALIZING...', cls: '' },
    { text: 'LOADING WHO SITUATION REPORT MODULE...', cls: 'dim' },
    { text: 'LOADING AFRICA CDC FEED...', cls: 'dim' },
    { text: 'CONNECTING TO FIELD CORRESPONDENTS — DRC/ITURI...', cls: 'dim' },
    { text: 'DECRYPTING BUNDIBUGYO STRAIN DATA...', cls: '' },
    { text: 'CROSS-REFERENCING REUTERS / AP / NBC...', cls: 'dim' },
    { text: 'OUTBREAK CONFIRMED — ACTIVE PHEIC STATUS', cls: '' },
    { text: '1,100+ SUSPECTED  ·  246+ DEATHS  ·  282 CONFIRMED', cls: '' },
    { text: '', cls: '' },
    { text: '[ ACCESS GRANTED ]', cls: 'access' },
  ];

  const container = document.getElementById('boot-lines');
  const screen    = document.getElementById('boot-screen');
  let i = 0;

  function nextLine() {
    if (i >= lines.length) {
      setTimeout(() => {
        screen.classList.add('fade-out');
        setTimeout(() => { screen.style.display = 'none'; }, 650);
        typewriterStats();
        setTimeout(() => NewUpdatesPopup.check(), 1800);
      }, 600);
      return;
    }
    const span = document.createElement('span');
    span.className = 'boot-line' + (lines[i].cls ? ' ' + lines[i].cls : '');
    span.textContent = lines[i].text || ' ';
    container.appendChild(span);
    i++;
    setTimeout(nextLine, i === lines.length ? 400 : Math.random() * 120 + 60);
  }

  nextLine();
})();

// ── New updates popup ─────────────────────────────────────────────────
const NewUpdatesPopup = {
  _KEY: 'ebola_seen_updates_v1',

  _getSeenIds() {
    try { return new Set(JSON.parse(localStorage.getItem(this._KEY)) || []); }
    catch { return new Set(); }
  },

  _saveSeenIds(ids) {
    localStorage.setItem(this._KEY, JSON.stringify([...ids]));
  },

  // Build a simple ID from each update item: date + first 40 chars of text
  _itemId(el) {
    const date = el.querySelector('.update-date')?.textContent?.trim().slice(0, 10) || '';
    const text = el.textContent?.trim().replace(/\s+/g, ' ').slice(0, 40) || '';
    return date + '|' + text;
  },

  check() {
    const items    = [...document.querySelectorAll('.update-item')];
    const allIds   = items.map(el => this._itemId(el));
    const seen     = this._getSeenIds();
    const isFirst  = seen.size === 0;

    // Always save current full set
    this._saveSeenIds(new Set(allIds));

    if (isFirst || allIds.length === 0) return; // no popup on first visit

    const newItems = items.filter(el => !seen.has(this._itemId(el)));
    if (newItems.length === 0) return;

    this._show(newItems);
    track('new_updates_shown', { count: newItems.length });
  },

  _show(newItems) {
    const list   = document.getElementById('new-updates-list');
    const popup  = document.getElementById('new-updates-popup');
    if (!list || !popup) return;

    list.innerHTML = newItems.map(el => {
      const date = el.querySelector('.update-date')?.textContent?.trim().slice(0, 10) || '';
      const text = el.childNodes[el.childNodes.length - 1]?.textContent?.trim() || '';
      return `<div class="nup-item"><span class="nup-date">${date}</span>${text}</div>`;
    }).join('');

    popup.style.display = 'block';
  },
};

function closeNewUpdates() {
  const popup = document.getElementById('new-updates-popup');
  if (popup) {
    popup.style.opacity = '0';
    popup.style.transition = 'opacity 0.2s';
    setTimeout(() => { popup.style.display = 'none'; }, 200);
  }
  track('new_updates_dismissed');
}

// ── Typewriter stats ────────────────────────────────────────────────────
function typewriterStats() {
  const values = document.querySelectorAll('.stat-value');
  values.forEach((el, idx) => {
    const final = el.textContent;
    el.textContent = '';
    let c = 0;
    setTimeout(() => {
      const iv = setInterval(() => {
        el.textContent = final.slice(0, ++c);
        if (c >= final.length) clearInterval(iv);
      }, 35);
    }, idx * 120);
  });
}

// ── Share dropdown ─────────────────────────────────────────────────────
function shareTracker() {
  const menu = document.getElementById('map-share-menu');
  menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
}

function shareVia(method) {
  const url  = encodeURIComponent('https://ebola.fyi');
  const text = encodeURIComponent('Live Ebola outbreak tracker — 2026 Bundibugyo strain, DRC & Uganda. Free, no paywall.');
  const links = {
    twitter:  `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
    whatsapp: `https://wa.me/?text=${text}%20${url}`,
    reddit:   `https://reddit.com/submit?url=${url}&title=${text}`,
  };
  if (links[method]) {
    window.open(links[method], '_blank', 'noopener,width=600,height=450');
    track('share', { method });
  } else {
    navigator.clipboard.writeText('https://ebola.fyi').then(() => {
      const btn = document.getElementById('map-copy-btn');
      btn.textContent = 'COPIED ✓';
      setTimeout(() => { btn.textContent = '[ COPY LINK ]'; }, 2000);
      track('share', { method: 'clipboard' });
    });
  }
  document.getElementById('map-share-menu').style.display = 'none';
}

// Close share menu if clicking outside
document.addEventListener('click', e => {
  const menu = document.getElementById('map-share-menu');
  const btn  = document.getElementById('map-share-btn');
  if (menu && !menu.contains(e.target) && e.target !== btn) {
    menu.style.display = 'none';
  }

  const smenu = document.getElementById('map-support-menu');
  const sbtn  = document.getElementById('map-support-btn');
  if (smenu && !smenu.contains(e.target) && e.target !== sbtn) {
    smenu.style.display = 'none';
  }

  const fmenu = document.getElementById('map-feedback-menu');
  const fbtn  = document.getElementById('map-feedback-btn');
  if (fmenu && !fmenu.contains(e.target) && e.target !== fbtn) {
    fmenu.style.display = 'none';
  }
});

// ── Feedback dropdown ─────────────────────────────────────────────────
function feedbackTracker() {
  const menu = document.getElementById('map-feedback-menu');
  menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
  if (menu.style.display === 'block') {
    document.getElementById('feedback-text').focus();
  }
  track('feedback_menu_open');
}

function submitFeedback() {
  const text = document.getElementById('feedback-text').value.trim();
  if (!text) return;
  const btn = document.getElementById('feedback-submit-btn');
  btn.textContent = '[ SENDING... ]';
  fetch('/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: text }),
  })
  .then(r => r.json())
  .then(() => {
    btn.textContent = '[ SENT ✓ ]';
    document.getElementById('feedback-text').value = '';
    track('feedback_submitted');
    setTimeout(() => {
      document.getElementById('map-feedback-menu').style.display = 'none';
      btn.textContent = '[ SEND ]';
    }, 1500);
  })
  .catch(() => {
    btn.textContent = '[ ERROR — RETRY ]';
    setTimeout(() => { btn.textContent = '[ SEND ]'; }, 2000);
  });
}

// ── Support dropdown ───────────────────────────────────────────────────
function supportTracker() {
  const menu = document.getElementById('map-support-menu');
  menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
  track('support_menu_open');
}

function supportVia(method) {
  const links = {
    coffee: 'https://buymeacoffee.com/breroz',
    venmo:  'https://venmo.com/u/BreRoz',
    paypal: 'https://paypal.me/breroz',
  };
  if (links[method]) {
    window.open(links[method], '_blank', 'noopener,width=600,height=500');
    track('support_click', { method });
  }
  document.getElementById('map-support-menu').style.display = 'none';
}

// ── Analytics helper ───────────────────────────────────────────────────
function track(event, params) {
  if (typeof gtag !== 'undefined') gtag('event', event, params || {});
}

// ── Tab switching ──────────────────────────────────────────────────────
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
    track('tab_click', { tab_name: btn.dataset.tab });
  });
});

// ── Situation nav ──────────────────────────────────────────────────────
const SitNav = {
  select(key) {
    document.querySelectorAll('.sit-nav-item').forEach(el => el.classList.remove('selected'));
    document.querySelectorAll('.sit-content').forEach(el => el.classList.remove('active'));
    const nav = document.querySelector(`.sit-nav-item[data-sit="${key}"]`);
    const pane = document.getElementById(`sit-${key}`);
    if (nav)  nav.classList.add('selected');
    if (pane) pane.classList.add('active');
    track('situation_select', { situation: key });
  }
};

// ── Disclaimer modal ───────────────────────────────────────────────────
(function() {
  const KEY = 'ebola_notice_v1';
  if (!localStorage.getItem(KEY)) {
    document.getElementById('disclaimer-modal').style.display = 'flex';
    track('disclaimer_shown');
  }
  document.getElementById('disclaimer-close').addEventListener('click', () => {
    localStorage.setItem(KEY, '1');
    document.getElementById('disclaimer-modal').style.display = 'none';
    track('disclaimer_acknowledged');
  });
})();

// ── D3 World Map ───────────────────────────────────────────────────────
(function() {
  const container = document.getElementById('world-map');
  if (!container) return;

  const w = container.clientWidth  || 900;
  const h = container.clientHeight || 500;

  const svg = d3.select('#world-map')
    .append('svg')
    .attr('width', '100%')
    .attr('height', '100%')
    .attr('viewBox', `0 0 ${w} ${h}`)
    .attr('preserveAspectRatio', 'xMidYMid meet');

  const projection = d3.geoNaturalEarth1()
    .scale(w / 5)
    .translate([w / 2, h / 2]);

  const path = d3.geoPath().projection(projection);

  // Zoom & pan
  const mapG = svg.append('g');
  const zoom = d3.zoom()
    .scaleExtent([1, 8])
    .translateExtent([[0, 0], [w, h]])
    .on('zoom', (event) => {
      mapG.attr('transform', event.transform);
    });
  svg.call(zoom);

  // Outbreak status by ISO alpha-3
  const outbreakStatus = {
    'COD': { status: 'active',     label: 'DR Congo — ACTIVE OUTBREAK · WHO PHEIC', cases: '515 confirmed · 91 confirmed deaths · CDC: 20,000+ cases possible in 3 months' },
    'UGA': { status: 'confirmed',  label: 'Uganda — 15 confirmed · BORDER WITH DRC CLOSED', cases: '15 confirmed · 1 dead · 2 recovered · 12 admitted' },
    'DEU': { status: 'monitoring', label: 'Germany — RECOVERED ✓ Dr. Peter Stafford discharged Jun 7', cases: 'Stafford + wife + 4 children all discharged · experimental treatment · "significant therapeutic success"' },
    'CZE': { status: 'monitoring', label: 'Czech Republic — Monitoring', cases: '1 US high-risk contact · Dr. LaRochelle · Bulovka Hospital, Prague' },
    'CAN': { status: 'monitoring', label: 'Canada — 90-day entry ban (DRC/Uganda/South Sudan)', cases: 'No confirmed cases · ban in effect' },
    'BRA': { status: 'monitoring', label: 'Brazil — 2 tested, alternative diagnoses', cases: '2 tested · one meningitis, one malaria · monitoring continues' },
    'ITA': { status: 'monitoring', label: 'Italy — 1 tested · NEGATIVE ✓', cases: '1 patient from Congo · tested negative for Ebola' },
    'USA': { status: 'monitoring', label: 'USA — 3 low-risk travelers monitored (Milwaukee, WI)', cases: 'No symptoms · no known Ebola contact · Milwaukee Health Dept + state/federal partners · Jun 4' },
  };

  function getFill(iso) {
    const s = outbreakStatus[iso];
    if (!s) return '#0f1a0f';
    if (s.status === 'active')     return '#660000';
    if (s.status === 'confirmed')  return '#664400';
    if (s.status === 'treatment')  return '#003300';
    if (s.status === 'monitoring') return '#004400';
    return '#0f1a0f';
  }

  const tooltip = document.getElementById('map-tooltip');

  const loadingEl = document.getElementById('map-loading');

  fetch('/static/data/world-simple.json')
    .then(r => {
      if (!r.ok) throw new Error('GeoJSON not found');
      return r.json();
    })
    .then(world => {
      if (loadingEl) loadingEl.style.display = 'none';

      mapG.selectAll('path')
        .data(world.features)
        .enter()
        .append('path')
        .attr('d', path)
        .attr('fill', d => getFill(d.properties.iso_a3 || d.id))
        .on('mousemove', function(event, d) {
          const iso = d.properties.iso_a3 || d.id;
          const info = outbreakStatus[iso];
          if (!info) {
            tooltip.style.display = 'none';
            return;
          }
          tooltip.style.display = 'block';
          tooltip.style.left = (event.offsetX + 12) + 'px';
          tooltip.style.top  = (event.offsetY + 12) + 'px';
          tooltip.innerHTML  = `<strong>${info.label}</strong><br>${info.cases}`;
        })
        .on('mouseenter', function(event, d) {
          const iso = d.properties.iso_a3 || d.id;
          if (outbreakStatus[iso]) track('map_country_hover', { country: iso });
        })
        .on('mouseleave', () => { tooltip.style.display = 'none'; });
    })
    .catch(() => {
      if (loadingEl) loadingEl.textContent = 'MAP DATA UNAVAILABLE — LOADING...';
    });

  // Province outbreak status (DRC + Uganda only)
  const provinceStatus = {
    // DRC — colored by severity
    'Ituri':     { fill: '#880000', label: 'Ituri — EPICENTRE · 17/36 health zones affected', cases: '300+ confirmed · Bunia, Mongbwalu, Nyakunde · Mambasa (ISIS-held — health workers cannot enter)' },
    'Nord-Kivu': { fill: '#660000', label: 'North Kivu — Active · 7 health zones', cases: 'Confirmed cases · Goma, Butembo · patients fleeing care' },
    'Sud-Kivu':  { fill: '#993300', label: 'South Kivu — Active · 1 health zone', cases: 'Katana (rebel-held) · burial team attacked Jun 2 · coffin abandoned' },
    // Uganda
    'Kampala':   { fill: '#664400', label: 'Kampala — Confirmed',   cases: '15 confirmed / 1 dead / 2 recovered · border with DRC closed' },
  };

  fetch('/static/data/provinces-drc-uga.json')
    .then(r => r.json())
    .then(provData => {
      // Province fill layer
      mapG.selectAll('.province-fill')
        .data(provData.features)
        .enter()
        .append('path')
        .attr('class', 'province-fill')
        .attr('d', path)
        .attr('fill', d => {
          const ps = provinceStatus[d.properties.name];
          return ps ? ps.fill : 'none';
        })
        .attr('stroke', 'none')
        .attr('pointer-events', 'none');

      // Province outline layer (all DRC + Uganda provinces)
      mapG.selectAll('.province-outline')
        .data(provData.features)
        .enter()
        .append('path')
        .attr('class', 'province-outline')
        .attr('d', path)
        .attr('fill', 'none')
        .attr('stroke', d => d.properties.adm0_a3 === 'COD' ? 'rgba(255,80,0,0.35)' : 'rgba(255,170,0,0.3)')
        .attr('stroke-width', 0.5)
        .attr('pointer-events', 'visibleStroke')
        .on('mousemove', function(event, d) {
          const ps = provinceStatus[d.properties.name];
          if (!ps) return;
          tooltip.style.display = 'block';
          tooltip.style.left = (event.offsetX + 12) + 'px';
          tooltip.style.top  = (event.offsetY + 12) + 'px';
          tooltip.innerHTML  = `<strong>${ps.label}</strong><br>${ps.cases}`;
        })
        .on('mouseleave', () => { tooltip.style.display = 'none'; });
    })
    .catch(() => {});

  // Legend
  const legend = [
    { color: '#660000', label: 'Active outbreak' },
    { color: '#664400', label: 'Confirmed cases' },
    { color: '#003300', label: 'Treatment (no local spread)' },
    { color: '#004400', label: 'Monitoring / Testing' },
  ];

  const lg = svg.append('g').attr('transform', `translate(10, ${h - 120})`);
  legend.forEach((item, i) => {
    lg.append('rect').attr('x', 0).attr('y', i * 18).attr('width', 12).attr('height', 12).attr('fill', item.color).attr('stroke', '#00cc00').attr('stroke-width', 0.5);
    lg.append('text').attr('x', 18).attr('y', i * 18 + 10).attr('fill', '#00cc00').attr('font-size', '10px').attr('font-family', "'Share Tech Mono', monospace").text(item.label);
  });
})();
