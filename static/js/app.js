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

      svg.selectAll('path')
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
