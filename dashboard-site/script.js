
/* PDC Dashboard script
   Expects:
   - payload.json   : latest run (from workflow)
   - history.json   : array of historical payloads [{build:{tag,status}, metrics:{...}, timestamp: "..."}]
*/

const latestTagEl = document.getElementById('latest-tag');
const latestStatusEl = document.getElementById('latest-status');
const latestCommitEl = document.getElementById('latest-commit');
const lastUpdatedEl = document.getElementById('last-updated');

const kpiCoverageEl = document.getElementById('kpi-coverage');
const kpiE2EEl = document.getElementById('kpi-e2e');
const kpiPerfEl = document.getElementById('kpi-perf');
const kpiSecEl = document.getElementById('kpi-sec');

const refreshBtn = document.getElementById('refresh-btn');

const fmtPct = (x, decimals = 2) => `${(x * 100).toFixed(decimals)}%`;
const fmtNum = (x) => (x ?? 0).toLocaleString();

async function fetchJSON(path) {
  const resp = await fetch(path, { cache: 'no-store' });
  if (!resp.ok) throw new Error(`Failed to fetch ${path}: ${resp.status}`);
  return resp.json();
}

async function load() {
  try {
    const payload = await fetchJSON('payload.json').catch(() => null);
    const history = await fetchJSON('history.json').catch(() => []);

    // Show latest payload KPIs
    if (payload && payload.build && payload.metrics) {
      const tag = payload.build.tag || '—';
      const status = payload.build.status || '—';
      const commit = payload.build.commit || '—';

      latestTagEl.textContent = `Tag: ${tag}`;
      latestStatusEl.textContent = `Status: ${status}`;
      latestCommitEl.textContent = `Commit: ${commit}`;

      const cov = payload.metrics.coverage ?? 0;
      const e2e = payload.metrics.e2e_pass_rate ?? 0;
      const perf = payload.metrics.perf_regression_pct ?? 0;
      const sec = payload.metrics.security_high_issues ?? 0;

      kpiCoverageEl.textContent = fmtPct(cov);
      kpiE2EEl.textContent = fmtPct(e2e);
      kpiPerfEl.textContent = fmtPct(perf);
      kpiSecEl.textContent = fmtNum(sec);

      // KPI coloring
      if (cov >= 0.85) kpiCoverageEl.classList.add('kpi-green');
      else if (cov >= 0.75) kpiCoverageEl.classList.add('kpi-amber');
      else kpiCoverageEl.classList.add('kpi-red');

      if (e2e >= 0.99) kpiE2EEl.classList.add('kpi-green');
      else if (e2e >= 0.9) kpiE2EEl.classList.add('kpi-amber');
      else kpiE2EEl.classList.add('kpi-red');

      if (perf <= 0.05) kpiPerfEl.classList.add('kpi-green');
      else if (perf <= 0.10) kpiPerfEl.classList.add('kpi-amber');
      else kpiPerfEl.classList.add('kpi-red');

      if (sec === 0) kpiSecEl.classList.add('kpi-green');
      else if (sec <= 2) kpiSecEl.classList.add('kpi-amber');
      else kpiSecEl.classList.add('kpi-red');

      lastUpdatedEl.textContent = new Date().toLocaleString();
    } else {
      latestTagEl.textContent = 'Tag: —';
      latestStatusEl.textContent = 'Status: —';
      latestCommitEl.textContent = 'Commit: —';
    }

    // Build history table & charts
    const rows = Array.isArray(history) ? history : [];
    renderHistoryTable(rows);
    renderCharts(rows);

  } catch (err) {
    console.error(err);
    lastUpdatedEl.textContent = 'Failed to load';
  }
}

function renderHistoryTable(rows) {
  const tbody = document.getElementById('history-tbody');
  tbody.innerHTML = '';

  // Show latest 20 entries (descending by timestamp if present)
  const sorted = rows.slice().sort((a, b) => {
    const ta = new Date(a.timestamp || 0).getTime();
    const tb = new Date(b.timestamp || 0).getTime();
    return tb - ta;
  }).slice(0, 20);

  for (const r of sorted) {
    const tr = document.createElement('tr');
    const tag = r?.build?.tag ?? '—';
    const status = r?.build?.status ?? '—';
    const cov = r?.metrics?.coverage ?? 0;
    const e2e = r?.metrics?.e2e_pass_rate ?? 0;
    const perf = r?.metrics?.perf_regression_pct ?? 0;
    const sec = r?.metrics?.security_high_issues ?? 0;
    const ts = r?.timestamp ? new Date(r.timestamp).toLocaleString() : '—';

    tr.innerHTML = `
      <td>${tag}</td>
      <td>${status}</td>
      <td>${fmtPct(cov)}</td>
      <td>${fmtPct(e2e)}</td>
      <td>${fmtPct(perf)}</td>
      <td>${fmtNum(sec)}</td>
      <td>${ts}</td>
    `;
    tbody.appendChild(tr);
  }
}

function renderCharts(rows) {
  const labels = rows.map(r => r?.build?.tag ?? '(unknown)');
  const cov = rows.map(r => r?.metrics?.coverage ?? null);
  const e2e = rows.map(r => r?.metrics?.e2e_pass_rate ?? null);
  const perf = rows.map(r => r?.metrics?.perf_regression_pct ?? null);
  const sec = rows.map(r => r?.metrics?.security_high_issues ?? null);

  const commonOpts = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { ticks: { autoSkip: true, maxRotation: 0 } },
      y: { beginAtZero: true }
    },
    plugins: {
      legend: { display: false },
      tooltip: { mode: 'index', intersect: false }
    }
  };

  const mkLine = (ctxId, dataArr, color, title) => {
    const ctx = document.getElementById(ctxId);
    if (!ctx) return;

    new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: title,
          data: dataArr,
          borderColor: color,
          backgroundColor: color + '33',
          tension: 0.25,
          borderWidth: 2,
          pointRadius: 2
        }]
      },
      options: commonOpts
    });
  };

  mkLine('chartCoverage', cov, '#22c55e', 'Coverage');
  mkLine('chartE2E', e2e, '#3b82f6', 'E2E Pass Rate');
  mkLine('chartPerf', perf, '#f59e0b', 'Perf Regression');
  mkLine('chartSec', sec, '#ef4444', 'Security High Issues');
}

refreshBtn.addEventListener('click', () => {
  load();
});

load();
