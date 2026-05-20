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
    'COD': { status: 'active',     label: 'DR Congo — ACTIVE OUTBREAK', cases: '600+ susp / 51 conf / 139 dead' },
    'UGA': { status: 'confirmed',  label: 'Uganda — Confirmed cases',    cases: '2 confirmed / 1 dead' },
    'DEU': { status: 'treatment',  label: 'Germany — Treatment (1 US missionary)', cases: 'Peter Stafford · Charité Hospital, Berlin' },
    'CZE': { status: 'monitoring', label: 'Czech Republic — Monitoring', cases: '1 US high-risk contact' },
  };

  function getFill(iso) {
    const s = outbreakStatus[iso];
    if (!s) return '#0f1a0f';
    if (s.status === 'active')     return '#660000';
    if (s.status === 'confirmed')  return '#664400';
    if (s.status === 'treatment')  return '#003300';
    if (s.status === 'monitoring') return '#002200';
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

  // Legend
  const legend = [
    { color: '#660000', label: 'Active outbreak' },
    { color: '#664400', label: 'Confirmed cases' },
    { color: '#003300', label: 'Treatment (no local spread)' },
    { color: '#002200', label: 'Monitoring' },
  ];

  const lg = svg.append('g').attr('transform', `translate(10, ${h - 90})`);
  legend.forEach((item, i) => {
    lg.append('rect').attr('x', 0).attr('y', i * 18).attr('width', 12).attr('height', 12).attr('fill', item.color).attr('stroke', '#00cc00').attr('stroke-width', 0.5);
    lg.append('text').attr('x', 18).attr('y', i * 18 + 10).attr('fill', '#00cc00').attr('font-size', '10px').attr('font-family', "'Share Tech Mono', monospace").text(item.label);
  });
})();
