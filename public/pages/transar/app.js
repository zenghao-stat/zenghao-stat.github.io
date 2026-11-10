/* 交互图使用正式发表版表 1–3 的数值，不重跑或模拟实验结果。 */
const $ = selector => document.querySelector(selector);
const NS = 'http://www.w3.org/2000/svg';
const colors = {};
const state = { metric: 'rmse', selected: 'Minnesota' };
let data;
const metrics = {
  rmse: {
    table: 'Table 1', label: 'County-level prediction RMSE', min: 0, max: .22, ticks: [0, .05, .1, .15, .2],
    context: '2020 election evaluation · county-level support-rate differences · mean over 20 runs',
    note: 'Source: published Table 1. RMSE is shown in the paper’s original support-rate units. Lower is better. The table reports averages without standard deviations, so this chart does not add error bars.'
  },
  bias: {
    table: 'Table 2', label: 'State-level prediction bias', min: -.1, max: .05, ticks: [-.1, -.05, 0, .05],
    context: '2020 election evaluation · signed state-level support-rate bias · reported values',
    note: 'Source: published Table 2. Values retain their original signs and units. Closer to zero means smaller absolute bias; a change of sign alone does not imply an improvement.'
  },
  accuracy: {
    table: 'Table 3', label: 'Correct winner predictions (%)', min: 0, max: 100, ticks: [0, 25, 50, 75, 100],
    context: '2020 election evaluation · correct state-winner predictions across 20 runs',
    note: 'Source: published Table 3. These are percentages of correct predictions across the 20 reported runs, rather than probabilities assigned to a party or county-level classification accuracy.'
  }
};
function syncPalette() {
  const css = getComputedStyle(document.documentElement);
  for (const k of ['paper', 'ink', 'muted', 'line', 'panel', 'accent', 'sar', 'transfer']) colors[k] = css.getPropertyValue('--' + k).trim();
  $('#theme-toggle').setAttribute('aria-label', document.documentElement.dataset.theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
}
function add(parent, tag, attrs = {}, text = '') {
  const node = document.createElementNS(NS, tag);
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
  if (text !== '') node.textContent = text;
  parent.append(node); return node;
}
function label(parent, x, y, text, attrs = {}) {
  return add(parent, 'text', { x, y, fill: colors.muted, 'font-size': 11, ...attrs }, text);
}
function format(value) {
  if (state.metric === 'accuracy') return value.toFixed(0) + '%';
  return (state.metric === 'bias' && value > 0 ? '+' : '') + value.toFixed(5);
}
function detail(parent, title, value, note, className = '') {
  const div = document.createElement('div'); div.className = className;
  const label = document.createElement('span'); label.className = 'detail-label'; label.textContent = title;
  const strong = document.createElement('strong'); strong.textContent = value; div.append(label, strong);
  if (note) { const small = document.createElement('small'); small.textContent = note; div.append(small); }
  parent.append(div);
}
function selectState(name) {
  state.selected = name; $('#state-select').value = name;
  const row = data.states.find(item => item.state === name), values = row[state.metric], parent = $('#state-detail');
  parent.replaceChildren();
  detail(parent, 'Selected state', name);
  detail(parent, 'SAR · target only', format(values[0]));
  detail(parent, 'tranSAR', format(values[1]));
  if (state.metric === 'accuracy') {
    const delta = values[1] - values[0], before = Math.round(values[0] / 100 * 20), after = Math.round(values[1] / 100 * 20);
    detail(parent, 'Correct-prediction change', (delta > 0 ? '+' : '') + delta.toFixed(0) + ' pp', before + '/20 → ' + after + '/20 correct runs', delta > 0 ? 'favorable' : delta < 0 ? 'unfavorable' : '');
  } else {
    const reduction = (1 - Math.abs(values[1]) / Math.abs(values[0])) * 100;
    detail(parent, state.metric === 'rmse' ? 'RMSE change' : 'Absolute bias change', Math.abs(reduction).toFixed(2) + '% ' + (reduction >= 0 ? 'lower' : 'higher'), 'Relative to target-only SAR', reduction >= 0 ? 'favorable' : 'unfavorable');
  }
  document.querySelectorAll('.chart-state').forEach(node => {
    const selected = node.dataset.state === name;
    node.classList.toggle('selected', selected); node.setAttribute('aria-pressed', String(selected));
  });
}
function render() {
  if (!data) return;
  const svg = $('#election-chart'); svg.replaceChildren();
  const meta = metrics[state.metric], width = Math.max(280, svg.clientWidth), compact = width < 500;
  const height = compact ? 430 : 445, left = compact ? 106 : 149, right = width - 22, top = 49, bottom = height - 51;
  const x = value => left + (value - meta.min) / (meta.max - meta.min) * (right - left);
  const rowY = index => top + 18 + index * (bottom - top - 36) / 5;
  svg.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
  add(svg, 'title', {}, meta.label + ': SAR and tranSAR');
  add(svg, 'desc', {}, 'Published ' + meta.table + '. Six swing states. Open circles show SAR; filled circles show tranSAR. Select a row to inspect exact values.');
  label(svg, left, 18, meta.label, { 'font-size': compact ? 10 : 11 });
  for (const tick of meta.ticks) {
    add(svg, 'line', { x1: x(tick), x2: x(tick), y1: top - 10, y2: bottom, stroke: colors.line, 'stroke-width': tick === 0 ? 1.2 : .7 });
    label(svg, x(tick), bottom + 23, state.metric === 'accuracy' ? tick : tick.toFixed(2), { 'text-anchor': 'middle', 'font-size': compact ? 10 : 11 });
  }
  data.states.forEach((row, index) => {
    const values = row[state.metric], cy = rowY(index);
    const group = add(svg, 'g', { class: 'chart-state', role: 'button', tabindex: 0, 'data-state': row.state, 'aria-pressed': 'false', 'aria-label': row.state + ': SAR ' + format(values[0]) + ', tranSAR ' + format(values[1]) });
    add(group, 'rect', { class: 'row-highlight', x: 0, y: cy - 24, width, height: 48, fill: colors.panel });
    add(group, 'rect', { x: 0, y: cy - 24, width, height: 48, fill: 'transparent' });
    label(group, left - 14, cy + 4, compact ? row.short : row.state, { 'text-anchor': 'end', fill: colors.ink, 'font-size': compact ? 11 : 12 });
    add(group, 'line', { x1: x(values[0]), x2: x(values[1]), y1: cy - 3, y2: cy + 3, stroke: colors.muted, 'stroke-width': 1.4, opacity: .65 });
    add(group, 'circle', { cx: x(values[0]), cy: cy - 3, r: 5, fill: colors.paper, stroke: colors.sar, 'stroke-width': 2 });
    add(group, 'circle', { class: 'transfer-point', cx: x(values[1]), cy: cy + 3, r: 5, fill: colors.transfer, stroke: colors.paper, 'stroke-width': 1 });
    const choose = () => selectState(row.state);
    group.addEventListener('pointerenter', choose); group.addEventListener('focus', choose); group.addEventListener('click', choose);
    group.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(); } });
  });
  $('#metric-context').textContent = meta.table + ' · ' + meta.context;
  $('#metric-note').textContent = meta.note;
  $('#table-caption').textContent = meta.table + ' · ' + meta.label + ' · Published values';
  const tbody = $('#election-table'); tbody.replaceChildren();
  data.states.forEach(row => {
    const tr = document.createElement('tr');
    for (const value of [row.state, ...row[state.metric].map(format)]) {
      const td = document.createElement('td'); td.textContent = value; tr.append(td);
    }
    tbody.append(tr);
  });
  selectState(state.selected);
}
document.querySelectorAll('[data-metric]').forEach(button => button.addEventListener('click', () => {
  state.metric = button.dataset.metric;
  document.querySelectorAll('[data-metric]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.metric === state.metric)));
  render();
}));
$('#state-select').addEventListener('change', () => { if (data) selectState($('#state-select').value); });
$('#theme-toggle').addEventListener('click', () => {
  document.documentElement.dataset.theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  try { localStorage.setItem('transar-theme', document.documentElement.dataset.theme); } catch { /* 存储不可用时仍允许切换。 */ }
  syncPalette(); render();
});
$('#copy-citation').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText($('#citation-text').textContent); $('#copy-status').textContent = 'BibTeX copied.'; }
  catch {
    const range = document.createRange(), selection = getSelection();
    range.selectNodeContents($('#citation-text')); selection.removeAllRanges(); selection.addRange(range);
    $('#copy-status').textContent = 'Citation selected. Use your browser’s Copy command.';
  }
});
syncPalette();
fetch('results.json').then(response => { if (!response.ok) throw new Error('Data request failed'); return response.json(); }).then(result => {
  data = result; render();
}).catch(() => { $('#metric-context').textContent = 'Chart data could not load. Please reload, or open Tables 1–3 in the paper.'; });
let lastWidth = 0, frame;
new ResizeObserver(() => {
  const width = Math.round($('#election-chart').clientWidth);
  if (width === lastWidth) return;
  lastWidth = width; cancelAnimationFrame(frame); frame = requestAnimationFrame(render);
}).observe($('#election-chart'));
if (window.MathJax?.startup?.promise) MathJax.startup.promise.then(() => MathJax.typesetPromise()).catch(() => { /* 不因公式网络错误阻塞图表。 */ });
