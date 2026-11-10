/* 理论示意与论文实验分开绘制。 */
const $ = s => document.querySelector(s);
const NS = 'http://www.w3.org/2000/svg';
const palette = {};
const state = { theory: 'finite', experiment: 'parameters', sampleIndex: 2, dataset: 'cifar100', method: 'ts' };
const complexityValues = { finite: 50, parametric: 10 };
let data;
function syncPalette() {
  const css = getComputedStyle(document.documentElement);
  for (const key of ['paper', 'ink', 'muted', 'line', 'panel', 'blue', 'orange']) palette[key] = css.getPropertyValue('--' + key).trim();
  $('#theme-toggle').setAttribute('aria-label', document.documentElement.dataset.theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
}
function add(parent, tag, attrs = {}, text = '') {
  const el = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  if (text !== '') el.textContent = text;
  parent.append(el); return el;
}
function label(parent, x, y, text, attrs = {}) {
  return add(parent, 'text', { x, y, fill: palette.muted, 'font-size': 11, ...attrs }, text);
}
function line(parent, points, attrs = {}) {
  return add(parent, 'polyline', { points: points.map(p => p.join(',')).join(' '), fill: 'none', 'stroke-width': 2, ...attrs });
}
function grid(svg, { left, right, top, bottom, y, ticks, heading }) {
  label(svg, left, 17, heading);
  for (const t of ticks) {
    add(svg, 'line', { x1: left, x2: right, y1: y(t), y2: y(t), stroke: palette.line, 'stroke-width': .7 });
    label(svg, left - 12, y(t) + 4, Number(t.toFixed(2)).toString(), { 'text-anchor': 'end' });
  }
  add(svg, 'line', { x1: left, x2: left, y1: top, y2: bottom, stroke: palette.line });
}
function setPressed(selector, key, value) {
  document.querySelectorAll(selector).forEach(el => el.setAttribute('aria-pressed', String(el.dataset[key] === value)));
}
function accessiblePoint(el, select) {
  el.addEventListener('pointerenter', select); el.addEventListener('focus', select); el.addEventListener('click', select);
  el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(); } });
}
function detailItem(parent, title, value, note) {
  const div = document.createElement('div'), small = document.createElement('span'), strong = document.createElement('strong');
  small.className = 'detail-label'; small.textContent = title; strong.textContent = value; div.append(small, strong);
  if (note) { const text = document.createElement('small'); text.textContent = note; div.append(text); }
  parent.append(div);
}
function finiteBound(m, n) {
  const log = Math.log(2 * m);
  return Math.sqrt(log / (2 * n)) + 1 / Math.sqrt(2 * n * log);
}
function renderTheory() {
  const svg = $('#theory-chart'); svg.replaceChildren();
  const finite = state.theory === 'finite', n = Number($('#sample-size').value), c = Number($('#complexity').value);
  complexityValues[state.theory] = c;
  const reference = finite ? 50 : 10;
  // 参数模式仅展示归一化趋势，不把未知常数设为可认证的风险界。
  const rate = (complexity, samples) => finite ? finiteBound(complexity, samples) * 100 : Math.sqrt((complexity + 1) / samples) / Math.sqrt(11 / 1000);
  const value = rate(c, n);
  $('#sample-size-value').textContent = n.toLocaleString('en-US'); $('#complexity-value').textContent = c.toLocaleString('en-US');
  $('#theory-readout').textContent = finite ? value.toFixed(2) + ' pp' : value.toFixed(2) + '× reference';
  $('#theory-caption').textContent = finite ? 'Finite-candidate upper bound at the selected sample size. This is not an observed coverage gap.' : 'Relative to d = 10 and n = 1,000. This rate illustration has no fitted constant or predicted coverage.';
  $('#finite-equation').hidden = !finite; $('#parametric-equation').hidden = finite;
  $('#theory-note').textContent = finite ? 'Proposition 4.2: M is the number of fixed candidate score functions; n is the calibration size. This is a theoretical upper bound, not a measured bias.' : 'Rate-shape illustration based on Proposition 4.6. Dimension d is a proxy for the score-class complexity in the stated parametric setting. The vertical axis is a relative scale, not a bias estimate.';
  const width = Math.max(280, svg.clientWidth), height = 310, left = 48, right = width - 18, top = 38, bottom = height - 53;
  svg.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
  const ceiling = Math.max(rate(c, 250), rate(reference, 250));
  const step = finite ? (ceiling > 20 ? 5 : 2) : (ceiling > 5 ? 2 : .5), ymax = Math.ceil(ceiling / step) * step;
  const x = v => left + v / 10000 * (right - left), y = v => bottom - v / ymax * (bottom - top);
  grid(svg, { left, right, top, bottom, y, ticks: Array.from({ length: Math.floor(ymax / step) + 1 }, (_, i) => i * step), heading: finite ? 'Upper bound (percentage points)' : 'Relative rate scale' });
  add(svg, 'title', {}, finite ? 'Finite-candidate tuning bias bound' : 'Normalized parametric rate illustration');
  add(svg, 'desc', {}, 'Theory only. Complexity ' + c + '; calibration size ' + n + '; displayed value ' + value.toFixed(3) + '.');
  for (const tick of [0, 2500, 5000, 7500, 10000]) label(svg, x(tick), bottom + 22, tick === 0 ? '0' : tick / 1000 + 'k', { 'text-anchor': 'middle', 'font-size': 10 });
  const samples = Array.from({ length: 100 }, (_, i) => 250 + i * 9750 / 99);
  line(svg, samples.map(v => [x(v), y(rate(reference, v))]), { stroke: palette.muted, 'stroke-dasharray': '5 4', 'stroke-width': 1.4 });
  line(svg, samples.map(v => [x(v), y(rate(c, v))]), { stroke: palette.blue, 'stroke-width': 2.3 });
  add(svg, 'line', { x1: x(n), x2: x(n), y1: y(value), y2: bottom, stroke: palette.blue, 'stroke-dasharray': '3 4', opacity: .6 });
  add(svg, 'circle', { cx: x(n), cy: y(value), r: 5, fill: palette.paper, stroke: palette.blue, 'stroke-width': 2 });
  label(svg, right, top + 13, (finite ? 'M = ' : 'd = ') + c, { 'text-anchor': 'end', fill: palette.blue });
  label(svg, (left + right) / 2, height - 5, 'Calibration size', { 'text-anchor': 'middle' });
}
document.querySelectorAll('[data-theory]').forEach(button => button.addEventListener('click', () => {
  state.theory = button.dataset.theory;
  const finite = state.theory === 'finite';
  $('#complexity').max = finite ? 500 : 100; $('#complexity').value = complexityValues[state.theory];
  $('#complexity-label').textContent = finite ? 'Number of candidates' : 'Parameter dimension';
  setPressed('[data-theory]', 'theory', state.theory); renderTheory();
}));
$('#sample-size').addEventListener('input', renderTheory); $('#complexity').addEventListener('input', renderTheory);

function showExperiment(index) {
  state.sampleIndex = index;
  const exp = data.figure2[state.experiment], same = exp.same[index], holdout = exp.holdout[index], parent = $('#experiment-detail');
  parent.replaceChildren();
  detailItem(parent, exp.xLabel, exp.x[index].toLocaleString('en-US'));
  detailItem(parent, 'Same data', same[0].toFixed(2) + '%', '± ' + same[1].toFixed(2) + '% SD');
  detailItem(parent, 'Separate hold-out', holdout[0].toFixed(2) + '%', '± ' + holdout[1].toFixed(2) + '% SD');
  detailItem(parent, 'Tuning bias', (same[0] - holdout[0]).toFixed(2) + ' pp', 'Difference of reported means');
  document.querySelectorAll('#experiment-chart .chart-point').forEach(point => {
    const active = Number(point.dataset.index) === index;
    point.classList.toggle('selected', active); point.setAttribute('aria-pressed', String(active));
  });
}
function renderExperiment() {
  const svg = $('#experiment-chart'); svg.replaceChildren();
  const exp = data.figure2[state.experiment], width = Math.max(280, svg.clientWidth), compact = width < 500;
  const height = compact ? 320 : 375, left = compact ? 40 : 52, right = width - 22, top = 39, bottom = height - 58, ymax = state.experiment === 'parameters' ? 8 : 7;
  const x = v => left + (v - exp.x[0]) / (exp.x.at(-1) - exp.x[0]) * (right - left);
  const y = v => bottom - Math.max(0, Math.min(ymax, v)) / ymax * (bottom - top);
  svg.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
  add(svg, 'title', {}, exp.title); add(svg, 'desc', {}, exp.context + '. Means and SD from Figure 2. Inspect each point for both protocols and their difference.');
  grid(svg, { left, right, top, bottom, y, ticks: state.experiment === 'parameters' ? [0, 2, 4, 6, 8] : [0, 2, 4, 6], heading: 'Coverage gap (%)' });
  $('#experiment-context').textContent = exp.context;
  exp.x.forEach(tick => label(svg, x(tick), bottom + 23, compact ? (tick / 1000).toFixed(1) + 'k' : tick.toLocaleString('en-US'), { 'text-anchor': 'middle', 'font-size': compact ? 10 : 11 }));
  label(svg, (left + right) / 2, height - 7, exp.xLabel, { 'text-anchor': 'middle' });
  for (const [key, color, name] of [['same', palette.orange, 'Same data'], ['holdout', palette.blue, 'Separate hold-out']]) {
    const values = exp[key];
    if ($('#figure-sd').checked) {
      const upper = values.map((v, i) => [x(exp.x[i]), y(v[0] + v[1])]), lower = values.map((v, i) => [x(exp.x[i]), y(v[0] - v[1])]).reverse();
      add(svg, 'polygon', { points: [...upper, ...lower].map(p => p.join(',')).join(' '), fill: color, opacity: .11 });
    }
    line(svg, values.map((v, i) => [x(exp.x[i]), y(v[0])]), { stroke: color, ...(key === 'holdout' ? { 'stroke-dasharray': '6 4' } : {}) });
    values.forEach((value, i) => {
      const point = add(svg, 'g', { class: 'chart-point', tabindex: 0, role: 'button', 'data-index': i, 'aria-label': name + ', ' + exp.xLabel + ' ' + exp.x[i] + ', coverage gap ' + value[0].toFixed(2) + ' percent, SD ' + value[1].toFixed(2), 'aria-pressed': 'false' });
      add(point, 'circle', { cx: x(exp.x[i]), cy: y(value[0]), r: 15, fill: 'transparent' });
      add(point, 'circle', { class: 'point-ring', cx: x(exp.x[i]), cy: y(value[0]), r: 9, fill: 'none', stroke: color, 'stroke-width': 1.2 });
      if (key === 'holdout') add(point, 'rect', { x: x(exp.x[i]) - 3.5, y: y(value[0]) - 3.5, width: 7, height: 7, fill: palette.paper, stroke: color, 'stroke-width': 1.7 });
      else add(point, 'circle', { cx: x(exp.x[i]), cy: y(value[0]), r: 4, fill: color });
      accessiblePoint(point, () => showExperiment(i));
    });
  }
  $('#experiment-table-caption').textContent = exp.title + ' · Coverage gap, mean ± SD';
  $('#experiment-x-heading').textContent = exp.xLabel;
  const tbody = $('#experiment-table'); tbody.replaceChildren();
  exp.x.forEach((v, i) => {
    const tr = document.createElement('tr');
    for (const text of [v.toLocaleString('en-US'), exp.same[i][0].toFixed(2) + ' ± ' + exp.same[i][1].toFixed(2), exp.holdout[i][0].toFixed(2) + ' ± ' + exp.holdout[i][1].toFixed(2), (exp.same[i][0] - exp.holdout[i][0]).toFixed(2)]) {
      const td = document.createElement('td'); td.textContent = text; tr.append(td);
    }
    tbody.append(tr);
  });
  showExperiment(state.sampleIndex);
}
document.querySelectorAll('[data-experiment]').forEach(button => button.addEventListener('click', () => {
  state.experiment = button.dataset.experiment; state.sampleIndex = 2;
  setPressed('[data-experiment]', 'experiment', state.experiment); if (data) renderExperiment();
}));
$('#figure-sd').addEventListener('change', () => { if (data) renderExperiment(); });
function showComparison(id) {
  state.method = id;
  const method = data.table1.find(row => row.id === id), value = method[state.dataset], parent = $('#comparison-detail');
  parent.replaceChildren(); parent.classList.add('comparison');
  detailItem(parent, 'Selected method', method.method);
  detailItem(parent, 'Tuning bias', value[0].toFixed(2) + ' pp', '± ' + value[1].toFixed(2) + ' pp SD');
  detailItem(parent, 'Calibration samples', data.datasets[state.dataset].n.toLocaleString('en-US'), data.datasets[state.dataset].name + ' · APS');
  document.querySelectorAll('#comparison-chart .chart-bar').forEach(bar => {
    const active = bar.dataset.id === id;
    bar.classList.toggle('selected', active); bar.setAttribute('aria-pressed', String(active));
  });
}
function renderComparison() {
  const svg = $('#comparison-chart'); svg.replaceChildren();
  const width = Math.max(280, svg.clientWidth), compact = width < 500;
  const height = 335, left = compact ? 135 : 205, right = width - (compact ? 20 : 36), top = 42, bottom = 275;
  const xmax = state.dataset === 'imagenet' ? 25 : 8, step = state.dataset === 'imagenet' ? 5 : 2;
  const x = v => left + v / xmax * (right - left);
  svg.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
  add(svg, 'title', {}, 'Table 1: tuning bias on ' + data.datasets[state.dataset].name);
  add(svg, 'desc', {}, 'Compare temperature scaling, vector scaling, and ConfTr with and without the order-preserving constraint. Bars show reported means; optional capped bars show one SD.');
  label(svg, left, 17, 'Tuning bias (percentage points)', { 'font-size': compact ? 10 : 11 });
  for (let t = 0; t <= xmax; t += step) {
    add(svg, 'line', { x1: x(t), x2: x(t), y1: top - 8, y2: bottom, stroke: palette.line, 'stroke-width': .7 });
    label(svg, x(t), bottom + 23, t, { 'text-anchor': 'middle' });
  }
  data.table1.forEach((row, i) => {
    const [mean, sd] = row[state.dataset], cy = top + 24 + i * 57, color = row.constrained ? palette.blue : palette.orange;
    const g = add(svg, 'g', { class: 'chart-bar', role: 'button', tabindex: 0, 'data-id': row.id, 'aria-label': row.method + ', tuning bias ' + mean.toFixed(2) + ' percentage points, SD ' + sd.toFixed(2), 'aria-pressed': 'false' });
    add(g, 'rect', { class: 'selection-bg', x: 0, y: cy - 24, width, height: 49, fill: palette.panel });
    label(g, left - 13, cy + 4, compact ? row.short : row.method, { 'text-anchor': 'end', 'font-size': compact ? 10 : 12, fill: palette.ink });
    add(g, 'rect', { class: 'bar-mark', x: left, y: cy - 8, width: Math.max(2, x(mean) - left), height: 16, fill: color, opacity: .9 });
    if ($('#table-sd').checked) {
      const lo = x(Math.max(0, mean - sd)), hi = x(mean + sd);
      add(g, 'path', { d: 'M' + lo + ',' + cy + 'H' + hi + 'M' + lo + ',' + (cy - 5) + 'V' + (cy + 5) + 'M' + hi + ',' + (cy - 5) + 'V' + (cy + 5), stroke: palette.ink, 'stroke-width': 1, fill: 'none' });
    }
    const text = add(g, 'text', { x: Math.min(right, x(mean + ($('#table-sd').checked ? sd : 0)) + 7), y: cy - 13, fill: color, 'font-size': 11, 'text-anchor': 'start' }, mean.toFixed(2));
    if (compact && mean > xmax * .65) { text.setAttribute('x', right); text.setAttribute('text-anchor', 'end'); }
    accessiblePoint(g, () => showComparison(row.id));
  });
  const meta = data.datasets[state.dataset];
  $('#table-context').textContent = meta.name + ' · calibration size ' + meta.n.toLocaleString('en-US') + ' · APS score · Table 1';
  showComparison(state.method);
}
document.querySelectorAll('[data-dataset]').forEach(button => button.addEventListener('click', () => {
  state.dataset = button.dataset.dataset; setPressed('[data-dataset]', 'dataset', state.dataset); if (data) renderComparison();
}));
$('#table-sd').addEventListener('change', () => { if (data) renderComparison(); });
$('#theme-toggle').addEventListener('click', () => {
  document.documentElement.dataset.theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  try { localStorage.setItem('tuning-bias-theme', document.documentElement.dataset.theme); } catch { /* 存储不可用时仍允许切换。 */ }
  syncPalette(); renderTheory(); if (data) { renderExperiment(); renderComparison(); }
});
$('#copy-citation').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText($('#citation-text').textContent); $('#copy-status').textContent = 'BibTeX copied.'; }
  catch {
    const selection = getSelection(), range = document.createRange();
    range.selectNodeContents($('#citation-text')); selection.removeAllRanges(); selection.addRange(range);
    $('#copy-status').textContent = 'Citation selected. Use your browser’s Copy command.';
  }
});
syncPalette(); renderTheory();
fetch('results.json').then(response => { if (!response.ok) throw new Error('Data request failed'); return response.json(); }).then(result => {
  data = result;
  data.table1.forEach(row => {
    const tr = document.createElement('tr');
    for (const value of [row.method, row.cifar100.map(v => v.toFixed(2)).join(' ± '), row.imagenet.map(v => v.toFixed(2)).join(' ± ')]) {
      const td = document.createElement('td'); td.textContent = value; tr.append(td);
    }
    $('#comparison-table').append(tr);
  });
  renderExperiment(); renderComparison();
}).catch(() => {
  $('#experiment-context').textContent = 'Chart data could not load. Please reload, or open the paper and downloadable JSON below.';
  $('#table-context').textContent = 'Chart data could not load. The paper contains the complete results.';
});
// 仅监听宽度变化，防止选中点更新引发循环重绘。
let lastWidths = '', frame;
new ResizeObserver(() => {
  const widths = ['#theory-chart', '#experiment-chart', '#comparison-chart'].map(s => Math.round($(s).clientWidth)).join(',');
  if (widths === lastWidths) return;
  lastWidths = widths; cancelAnimationFrame(frame);
  frame = requestAnimationFrame(() => { renderTheory(); if (data) { renderExperiment(); renderComparison(); } });
}).observe($('main'));
if (window.MathJax?.startup?.promise) MathJax.startup.promise.then(() => MathJax.typesetPromise()).catch(() => { /* 公式网络请求失败时不阻塞图表。 */ });
