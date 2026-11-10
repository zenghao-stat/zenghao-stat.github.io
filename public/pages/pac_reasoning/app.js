/* 数据来自 CR 表 1；校准示意单独使用合成数值。 */
const $ = (selector) => document.querySelector(selector);
const NS = 'http://www.w3.org/2000/svg';
const colors = {};
try { if (localStorage.getItem('pac-reasoning-theme') === 'dark') document.documentElement.dataset.theme = 'dark'; } catch { /* 存储不可用时使用默认浅色。 */ }
function syncPalette() {
  const css = getComputedStyle(document.documentElement);
  for (const [key, variable] of Object.entries({ green: '--accent', lightGreen: '--accent-soft', gray: '--muted', line: '--line', rust: '--rust', ink: '--ink', muted: '--muted', paper: '--paper' })) colors[key] = css.getPropertyValue(variable).trim();
  $('#theme-toggle').setAttribute('aria-label', document.documentElement.dataset.theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
}
syncPalette();

function svgNode(tag, attrs = {}, text = '') {
  const node = document.createElementNS(NS, tag);
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, String(value));
  if (text) node.textContent = text;
  return node;
}
function add(parent, tag, attrs, text) { const node = svgNode(tag, attrs, text); parent.append(node); return node; }
function label(parent, x, y, text, attrs = {}) { return add(parent, 'text', { x, y, fill: colors.muted, 'font-size': 12, ...attrs }, text); }

// 示意中的上界有意不单调，展示首个失败后的点不可重新加入。
const demoUCB = [0.014, 0.023, 0.036, 0.052, 0.043, 0.065, 0.082, 0.074];
function renderCalibration() {
  const svg = $('#calibration-chart');
  svg.replaceChildren();
  const eps = Number($('#epsilon').value) / 1000;
  const failedIndex = demoUCB.findIndex((v) => v > eps);
  const passed = failedIndex < 0 ? demoUCB.length : failedIndex;
  const width = Math.max(300, Math.min(660, svg.clientWidth || 660));
  svg.setAttribute('viewBox', `0 0 ${width} 340`);
  const left = 44, right = width - 16, top = 35, bottom = 275;
  const x = (i) => left + (i + 1) / 9 * (right - left);
  const y = (v) => bottom - v / 0.1 * (bottom - top);
  add(svg, 'title', {}, 'Fixed-sequence calibration: stop at the first failure');
  add(svg, 'desc', {}, `Synthetic illustration. Tolerance ${eps.toFixed(3)}; ${passed} thresholds pass. ${failedIndex < 0 ? 'All grid points pass.' : `Stop at threshold ${failedIndex + 1}.`}`);
  for (const tick of [0, .02, .04, .06, .08, .1]) {
    add(svg, 'line', { x1: left, x2: right, y1: y(tick), y2: y(tick), stroke: colors.line });
    label(svg, left - 12, y(tick) + 4, tick.toFixed(2), { 'text-anchor': 'end', 'font-size': 11 });
  }
  label(svg, left, 18, 'Upper confidence bound (synthetic)', { 'font-size': 11 });
  add(svg, 'line', { x1: left, x2: right, y1: y(eps), y2: y(eps), stroke: colors.rust, 'stroke-dasharray': '5 4', 'stroke-width': 1.5 });
  label(svg, right, y(eps) - 9, `ε = ${eps.toFixed(3)}`, { fill: colors.rust, 'text-anchor': 'end', 'font-size': 11 });
  demoUCB.forEach((value, i) => {
    const color = i < passed ? colors.green : i === failedIndex ? colors.rust : '#aeb4aa';
    add(svg, 'line', { x1: x(i), x2: x(i), y1: bottom, y2: y(value), stroke: color, 'stroke-width': 2, opacity: i > failedIndex && failedIndex >= 0 ? .45 : 1 });
    add(svg, 'circle', { cx: x(i), cy: y(value), r: 6, fill: color });
    label(svg, x(i), bottom + 23, `u${i + 1}`, { 'text-anchor': 'middle', 'font-size': 12 });
    if (i === passed - 1) {
      add(svg, 'circle', { cx: x(i), cy: y(value), r: 12, stroke: colors.green, fill: 'none', 'stroke-width': 1.5 });
      label(svg, x(i), y(value) - 19, 'selected', { 'text-anchor': 'middle', fill: colors.green, 'font-size': 11 });
    }
  });
  label(svg, (left + right) / 2, 328, width < 450 ? 'Pre-specified thresholds →' : 'Pre-specified thresholds, tested in increasing order →', { 'text-anchor': 'middle', 'font-size': 11 });
  $('#epsilon-value').textContent = `ε = ${eps.toFixed(3)}`;
  $('#calibration-state').textContent = passed === 0 ? 'The first test fails. Fall back to u₀: always use the thinking model.' : failedIndex < 0 ? 'All tests pass. Select u₈, the final grid point.' : `Stop at u${failedIndex + 1}. Select u${passed}, the preceding threshold.`;
}
$('#epsilon').addEventListener('input', renderCalibration);
renderCalibration();

let data, dataset = 'math', selected = 'm4';
const isPAC = (row) => row.method === 'PAC Reasoning';
const number = (v, digits) => v.toFixed(digits);

function showDetail(row) {
  selected = row.id;
  const values = row[dataset], meta = data.datasets[dataset];
  const detail = $('#point-detail');
  detail.replaceChildren();
  const p = document.createElement('p'); p.className = 'eyebrow'; p.textContent = 'Selected operating point'; detail.append(p);
  const h = document.createElement('h3'); h.textContent = row.method; detail.append(h);
  const score = document.createElement('span'); score.className = 'score-name'; score.textContent = row.score === '—' ? 'No uncertainty-score variant' : `${row.score} uncertainty`; detail.append(score);
  const pickerLabel = document.createElement('label'); pickerLabel.className = 'method-picker'; pickerLabel.textContent = 'Inspect a method'; pickerLabel.htmlFor = 'method-picker';
  const picker = document.createElement('select'); picker.id = 'method-picker';
  for (const item of data.methods.filter((r) => ($('#all-methods').checked || !['CoD', 'NoThinking'].includes(r.method)) && r[dataset][$('#metric').value])) {
    const option = document.createElement('option'); option.value = item.id; option.textContent = `${item.method}${item.score === '—' ? '' : ` · ${item.score}`}`; picker.append(option);
  }
  picker.value = selected;
  picker.addEventListener('change', () => {
    const id = picker.value; showDetail(data.methods.find((item) => item.id === id));
    $('#method-picker').focus({ preventScroll: true });
  });
  detail.append(pickerLabel, picker);
  const dl = document.createElement('dl'); dl.className = 'detail-stats';
  for (const [key, title, digits, suffix] of [['error', 'Binary loss', 4, ''], ['stp', 'Tokens saved', 2, '%'], ['ecp', 'Expert calls', 2, '%']]) {
    const div = document.createElement('div'); div.className = 'detail-stat';
    const dt = document.createElement('dt'); dt.textContent = title;
    const dd = document.createElement('dd');
    if (values[key]) {
      dd.textContent = number(values[key][0], digits) + suffix;
      const small = document.createElement('small'); small.textContent = `± ${number(values[key][1], digits)}${suffix} SD`; dd.append(small);
    } else dd.textContent = '—';
    div.append(dt, dd); dl.append(div);
  }
  detail.append(dl);
  const status = document.createElement('p');
  const over = values.error[0] > meta.epsilon;
  status.className = `mean-status${over ? ' over' : ''}`;
  status.textContent = `${over ? 'Mean loss above' : 'Mean loss within'} ε = ${meta.epsilon.toFixed(2)}`;
  detail.append(status);
  const note = document.createElement('p'); note.className = 'detail-instruction'; note.textContent = '100 runs · mean ± SD. Means describe this experiment; statistical guarantees require the conditions in the paper.'; detail.append(note);
  document.querySelectorAll('.plot-point').forEach((p) => { p.classList.toggle('selected', p.dataset.id === selected); });
}

function renderResults() {
  const svg = $('#results-chart'); svg.replaceChildren();
  const meta = data.datasets[dataset], metric = $('#metric').value, all = $('#all-methods').checked;
  const rows = data.methods.filter((row) => (all || !['CoD', 'NoThinking'].includes(row.method)) && row[dataset][metric]);
  if (!rows.some((r) => r.id === selected)) selected = 'm4';
  const width = Math.max(300, Math.min(760, svg.clientWidth || 760));
  const height = width < 450 ? 370 : 450;
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  const left = width < 450 ? 48 : 68, right = width - 24, top = 37, bottom = height - 74;
  const xmax = dataset === 'math' ? all ? .52 : .06 : .13;
  const ymin = metric === 'stp' ? -45 : 0, ymax = metric === 'stp' ? 110 : 105;
  const x = (v) => left + v / xmax * (right - left);
  const y = (v) => bottom - (v - ymin) / (ymax - ymin) * (bottom - top);
  const clampX = (v) => Math.max(left, Math.min(right, x(v)));
  const clampY = (v) => Math.max(top, Math.min(bottom, y(v)));
  add(svg, 'title', {}, `${meta.name}: binary loss versus ${metric === 'stp' ? 'tokens saved' : 'expert calls'}`);
  add(svg, 'desc', {}, `CR Table 1. Tolerance ${meta.epsilon}. Each focusable point is a method's mean over 100 runs. Error bars are one standard deviation, clipped at the chart edges. Use Tab to inspect points, or tap or hover.`);
  add(svg, 'rect', { x: left, y: top, width: x(meta.epsilon) - left, height: bottom - top, fill: colors.lightGreen, opacity: .6 });
  for (const tick of metric === 'stp' ? [-40, 0, 40, 80] : [0, 25, 50, 75, 100]) {
    add(svg, 'line', { x1: left, x2: right, y1: y(tick), y2: y(tick), stroke: colors.line, 'stroke-width': tick === 0 ? 1.4 : 1 });
    label(svg, left - 12, y(tick) + 4, `${tick}%`, { 'text-anchor': 'end', 'font-size': 12 });
  }
  for (let i = 0; i <= 5; i++) {
    const value = i * xmax / 5;
    label(svg, x(value), bottom + 25, value.toFixed(3), { 'text-anchor': 'middle', 'font-size': 12 });
  }
  add(svg, 'line', { x1: x(meta.epsilon), x2: x(meta.epsilon), y1: top, y2: bottom, stroke: colors.green, 'stroke-dasharray': '5 5', 'stroke-width': 1.4 });
  label(svg, x(meta.epsilon) + 8, top + 16, `ε = ${meta.epsilon}`, { fill: colors.green, 'font-size': 12 });
  label(svg, left, 17, metric === 'stp' ? 'Tokens saved (%) ↑' : 'Expert calls (%) ↓', { 'font-size': 12 });
  label(svg, (left + right) / 2, height - 19, width < 450 ? 'Mean binary loss ↓' : 'Mean binary loss relative to thinking ↓', { 'text-anchor': 'middle', 'font-size': 13 });
  const pacRows = rows.filter(isPAC), baselineRows = rows.filter((r) => !isPAC(r));
  for (const row of [...baselineRows, ...pacRows]) {
    const values = row[dataset], xv = x(values.error[0]), yv = y(values[metric][0]);
    const color = isPAC(row) ? colors.green : colors.gray;
    const group = add(svg, 'g', { class: 'plot-point', tabindex: '0', role: 'button', 'aria-label': `${row.method}, ${row.score}. Mean loss ${values.error[0]}, ${metric === 'stp' ? 'tokens saved' : 'expert calls'} ${values[metric][0]} percent. Select for standard deviations.`, 'data-id': row.id });
    add(group, 'line', { x1: clampX(values.error[0] - values.error[1]), x2: clampX(values.error[0] + values.error[1]), y1: yv, y2: yv, stroke: color, opacity: .4 });
    add(group, 'line', { x1: xv, x2: xv, y1: clampY(values[metric][0] - values[metric][1]), y2: clampY(values[metric][0] + values[metric][1]), stroke: color, opacity: .4 });
    add(group, 'circle', { cx: xv, cy: yv, r: 15, fill: 'transparent' });
    add(group, 'circle', { cx: xv, cy: yv, r: 12, fill: 'none', stroke: color, 'stroke-width': 1.5, class: 'point-ring' });
    if (row.score === 'Verbalized') add(group, 'rect', { x: xv - 5, y: yv - 5, width: 10, height: 10, fill: color, stroke: colors.paper, 'stroke-width': 1.5 });
    else add(group, 'circle', { cx: xv, cy: yv, r: isPAC(row) ? 7 : 5, fill: color, stroke: colors.paper, 'stroke-width': 1.5 });
    add(group, 'title', {}, `${row.method} · ${row.score}`);
    if (isPAC(row)) {
      const dx = row.score === 'Verbalized' ? -12 : 12;
      const dy = row.score === 'Verbalized' ? 25 : -15;
      const text = width < 450 ? (row.score === 'Verbalized' ? 'PAC · V' : 'PAC · L') : (row.score === 'Verbalized' ? 'PAC · verbalized' : 'PAC · logits');
      label(group, xv + dx, yv + dy, text, { fill: colors.green, 'font-size': 11, 'font-weight': 600, 'text-anchor': dx < 0 ? 'end' : 'start' });
    }
    group.addEventListener('mouseenter', () => showDetail(row));
    group.addEventListener('focus', () => showDetail(row));
    group.addEventListener('click', () => showDetail(row));
    group.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); showDetail(row); } });
  }
  $('#plot-title').textContent = `${meta.name} · binary loss`;
  $('#tolerance-label').textContent = `ε = ${meta.epsilon} · α = 0.05`;
  $('#table-caption').textContent = `CR Table 1 · ${meta.name} · mean ± SD over 100 runs`;
  const table = $('#results-table'); table.replaceChildren();
  for (const row of data.methods) {
    const tr = document.createElement('tr'); if (isPAC(row)) tr.className = 'pac-row';
    const title = document.createElement('th'); title.scope = 'row'; title.textContent = row.method + (row.score === '—' ? '' : ` · ${row.score}`); tr.append(title);
    for (const key of ['error', 'ecp', 'stp']) {
      const td = document.createElement('td'); const value = row[dataset][key], digits = key === 'error' ? 4 : 2;
      td.textContent = value ? `${number(value[0], digits)} ± ${number(value[1], digits)}` : '—'; tr.append(td);
    }
    table.append(tr);
  }
  $('#success-heading').textContent = `${meta.success.count} of 100 runs`;
  $('#success-detail').textContent = `PAC Reasoning with the logits score meets the empirical test-loss tolerance of ${meta.epsilon} in ${meta.success.count} runs on ${meta.name}. Exact 95% binomial interval: ${meta.success.interval[0]}–${meta.success.interval[1]}%.`;
  const costReduction = (1 - meta.cost.dollars[1] / meta.cost.dollars[0]) * 100;
  $('#cost-heading').textContent = `${Math.round(costReduction)}% lower dollar cost`;
  $('#cost-detail').textContent = `${meta.name}: reported test-set cost drops from $${meta.cost.dollars[0].toFixed(2)} to $${meta.cost.dollars[1].toFixed(2)}, and total latency from ${(meta.cost.latency_s[0] / 1000).toFixed(1)}k s to ${(meta.cost.latency_s[1] / 1000).toFixed(1)}k s. Prices and setup are those used in the CR.`;
  showDetail(rows.find((r) => r.id === selected));
}

fetch('results.json').then((response) => {
  if (!response.ok) throw new Error(`Data request failed: ${response.status}`);
  return response.json();
}).then((value) => {
  data = value;
  renderResults();
  document.querySelectorAll('[data-dataset]').forEach((button) => {
    button.addEventListener('click', () => {
      dataset = button.dataset.dataset;
      document.querySelectorAll('[data-dataset]').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
      renderResults();
    });
  });
  $('#metric').addEventListener('change', renderResults);
  $('#all-methods').addEventListener('change', renderResults);
}).catch(() => {
  $('#point-detail').textContent = 'The chart data could not load. Please reload, or use the full numerical table in the camera-ready PDF.';
  $('#plot-title').textContent = 'Chart data unavailable';
});

$('#copy-citation').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText($('#citation-text').textContent);
    $('#copy-status').textContent = 'Citation copied.';
  } catch {
    const selection = window.getSelection();
    const range = document.createRange(); range.selectNodeContents($('#citation-text'));
    selection.removeAllRanges(); selection.addRange(range);
    $('#copy-status').textContent = 'Citation selected. Press Ctrl+C or ⌘C to copy.';
  }
});

let resizeFrame;
window.addEventListener('resize', () => {
  cancelAnimationFrame(resizeFrame);
  resizeFrame = requestAnimationFrame(() => { renderCalibration(); if (data) renderResults(); });
});

$('#theme-toggle').addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem('pac-reasoning-theme', next); } catch { /* 不影响主题切换。 */ }
  syncPalette(); renderCalibration(); if (data) renderResults();
});
