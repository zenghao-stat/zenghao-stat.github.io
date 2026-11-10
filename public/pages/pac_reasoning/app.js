/* 数据来自论文表 1；校准示意单独使用合成数值。 */
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

// 正文与交互图共用 MathJax；缓存转换结果，避免滑杆重复排版同一公式。
const mathReady = window.MathJax.startup.promise;
const mathCache = new Map();
function mathSVG(tex) {
  if (!mathCache.has(tex)) mathCache.set(tex, mathReady.then(() => MathJax.tex2svgPromise(tex, { display: false })));
  return mathCache.get(tex).then((node) => node.cloneNode(true));
}
function setMath(node, tex) {
  node.dataset.math = tex;
  node.textContent = `\\(${tex}\\)`;
  mathSVG(tex).then((math) => { if (node.isConnected && node.dataset.math === tex) node.replaceChildren(math); });
}
function mathLabel(parent, x, y, tex, attrs = {}) {
  const group = add(parent, 'g', { class: 'math-label', color: attrs.fill || colors.muted });
  mathSVG(tex).then((math) => {
    if (!group.isConnected) return;
    const svg = math.querySelector('svg');
    const [, minY, width, height] = svg.getAttribute('viewBox').split(/\s+/).map(Number);
    const scale = (attrs['font-size'] || 12) / 1000;
    const offset = attrs['text-anchor'] === 'end' ? width * scale : attrs['text-anchor'] === 'middle' ? width * scale / 2 : 0;
    svg.setAttribute('x', x - offset); svg.setAttribute('y', y + minY * scale);
    svg.setAttribute('width', width * scale); svg.setAttribute('height', height * scale);
    group.append(svg);
  });
  return group;
}
// 只扫描静态区域；交互区域由 setMath 更新，避免已移除节点进入排版队列。
mathReady.then(() => MathJax.typesetPromise([...document.querySelectorAll('.tldr, .routing-figure, .lab-copy p:not(.eyebrow), .equation, .results-section > .source-note')]));

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
  mathLabel(svg, right, y(eps) - 9, `\\epsilon = ${eps.toFixed(3)}`, { fill: colors.rust, 'text-anchor': 'end', 'font-size': 11 });
  demoUCB.forEach((value, i) => {
    const color = i < passed ? colors.green : i === failedIndex ? colors.rust : '#aeb4aa';
    add(svg, 'line', { x1: x(i), x2: x(i), y1: bottom, y2: y(value), stroke: color, 'stroke-width': 2, opacity: i > failedIndex && failedIndex >= 0 ? .45 : 1 });
    add(svg, 'circle', { cx: x(i), cy: y(value), r: 6, fill: color });
    mathLabel(svg, x(i), bottom + 23, `u_{${i + 1}}`, { 'text-anchor': 'middle', 'font-size': 12 });
    if (i === passed - 1) {
      add(svg, 'circle', { cx: x(i), cy: y(value), r: 12, stroke: colors.green, fill: 'none', 'stroke-width': 1.5 });
      label(svg, x(i), y(value) - 19, 'selected', { 'text-anchor': 'middle', fill: colors.green, 'font-size': 11 });
    }
  });
  label(svg, (left + right) / 2, 328, width < 450 ? 'Pre-specified thresholds →' : 'Pre-specified thresholds, tested in increasing order →', { 'text-anchor': 'middle', 'font-size': 11 });
  setMath($('#epsilon-value'), `\\epsilon = ${eps.toFixed(3)}`);
  const state = $('#calibration-state'); state.replaceChildren();
  const threshold = document.createElement('span');
  if (passed === 0) {
    state.append('The first test fails. Fall back to ', threshold, ': always use the thinking model.');
    setMath(threshold, 'u_0');
  } else if (failedIndex < 0) {
    state.append('All tests pass. Select ', threshold, ', the final grid point.');
    setMath(threshold, 'u_8');
  } else {
    const preceding = document.createElement('span');
    state.append('Stop at ', threshold, '. Select ', preceding, ', the preceding threshold.');
    setMath(threshold, `u_{${failedIndex + 1}}`); setMath(preceding, `u_{${passed}}`);
  }
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
  const identity = document.createElement('div'); identity.className = 'detail-identity'; detail.append(identity);
  const p = document.createElement('p'); p.className = 'eyebrow'; p.textContent = 'Inspect a method'; identity.append(p);
  const h = document.createElement('h3'); h.textContent = row.method; identity.append(h);
  const score = document.createElement('span'); score.className = 'score-name'; score.textContent = row.score === '—' ? 'No uncertainty-score variant' : `${row.score} uncertainty`; identity.append(score);
  const pickerLabel = document.createElement('label'); pickerLabel.className = 'method-picker'; pickerLabel.textContent = 'Choose a method'; pickerLabel.htmlFor = 'method-picker';
  const picker = document.createElement('select'); picker.id = 'method-picker';
  for (const item of data.methods.filter((r) => ($('#all-methods').checked || !['CoD', 'NoThinking'].includes(r.method)) && r[dataset][$('#metric').value])) {
    const option = document.createElement('option'); option.value = item.id; option.textContent = `${item.method}${item.score === '—' ? '' : ` · ${item.score}`}`; picker.append(option);
  }
  picker.value = selected;
  picker.addEventListener('change', () => {
    const id = picker.value; showDetail(data.methods.find((item) => item.id === id));
    $('#method-picker').focus({ preventScroll: true });
  });
  identity.append(pickerLabel, picker);
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
  status.append(`${over ? 'Mean loss above' : 'Mean loss within'} `);
  const tolerance = document.createElement('span'); status.append(tolerance);
  identity.append(status);
  setMath(tolerance, `\\epsilon = ${meta.epsilon.toFixed(2)}`);
  document.querySelectorAll('.plot-point').forEach((point) => {
    point.classList.toggle('selected', point.dataset.id === selected);
    point.setAttribute('aria-pressed', String(point.dataset.id === selected));
  });
}

function renderResults() {
  const svg = $('#results-chart'); svg.replaceChildren();
  const meta = data.datasets[dataset], metric = $('#metric').value, all = $('#all-methods').checked;
  const rows = data.methods.filter((row) => (all || !['CoD', 'NoThinking'].includes(row.method)) && row[dataset][metric]);
  if (!rows.some((r) => r.id === selected)) selected = 'm4';
  const width = Math.max(300, svg.clientWidth || 864);
  const compact = width < 500, height = compact ? 340 : 410;
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.classList.toggle('show-all-sd', $('#show-uncertainty').checked);
  const left = compact ? 43 : 53, right = width - 20, top = 43, bottom = height - 59;
  // 使用易读刻度与数据对应的范围；均值和标准差均保持论文原值。
  const xmax = dataset === 'math' ? all ? .55 : .06 : .12;
  const xstep = dataset === 'math' ? all ? .1 : .01 : .02;
  const ymin = metric === 'stp' ? dataset === 'math' ? -10 : -40 : 0;
  const ymax = metric === 'stp' ? dataset === 'math' ? 90 : 60 : 100;
  const yticks = metric === 'stp' ? dataset === 'math' ? [0, 20, 40, 60, 80] : [-40, -20, 0, 20, 40, 60] : [0, 20, 40, 60, 80, 100];
  const x = (v) => left + v / xmax * (right - left);
  const y = (v) => bottom - (v - ymin) / (ymax - ymin) * (bottom - top);
  const clampX = (v) => Math.max(left, Math.min(right, x(v)));
  const clampY = (v) => Math.max(top, Math.min(bottom, y(v)));
  const familyColor = (row) => isPAC(row) ? colors.green : row.method === 'Naive control' ? colors.rust : row.method === 'Naive threshold' ? colors.gray : colors.ink;
  add(svg, 'title', {}, `${meta.name}: binary loss versus ${metric === 'stp' ? 'tokens saved' : 'expert calls'}`);
  add(svg, 'desc', {}, `Table 1. Tolerance ${meta.epsilon}. Points are means over 100 runs. By default, capped bars show one standard deviation for the selected point. Toggle All SD bars to show the remaining bars. Bars are clipped at chart edges. Use Tab, tap, or hover to select.`);
  add(svg, 'rect', { x: left, y: top, width: x(meta.epsilon) - left, height: bottom - top, fill: colors.lightGreen, opacity: .5 });
  label(svg, left + 10, top + 17, 'Below tolerance', { fill: colors.green, 'font-size': compact ? 10 : 11 });
  for (const tick of yticks) {
    add(svg, 'line', { x1: left, x2: right, y1: y(tick), y2: y(tick), stroke: colors.line, 'stroke-width': tick === 0 ? 1.2 : .7 });
    label(svg, left - 10, y(tick) + 4, `${tick}`, { 'text-anchor': 'end', 'font-size': 11 });
  }
  const tickCount = Math.floor(xmax / xstep + .001);
  for (let i = 0; i <= tickCount; i++) {
    if (compact && i % 2 && i !== tickCount) continue;
    const value = i * xstep;
    add(svg, 'line', { x1: x(value), x2: x(value), y1: bottom, y2: bottom + 4, stroke: colors.line });
    label(svg, x(value), bottom + 22, value.toFixed(all && dataset === 'math' ? 1 : 2), { 'text-anchor': 'middle', 'font-size': 11 });
  }
  add(svg, 'line', { x1: x(meta.epsilon), x2: x(meta.epsilon), y1: top, y2: bottom, stroke: colors.green, 'stroke-dasharray': '4 5', 'stroke-width': 1.2 });
  mathLabel(svg, x(meta.epsilon) + 8, top + 18, `\\epsilon = ${meta.epsilon}`, { fill: colors.green, 'font-size': 12 });
  label(svg, left, 17, metric === 'stp' ? 'Tokens saved (%) ↑' : 'Expert calls (%) ↓', { 'font-size': 12, fill: colors.ink });
  label(svg, (left + right) / 2, height - 8, compact ? 'Mean binary loss ↓' : 'Mean binary loss relative to the thinking model ↓', { 'text-anchor': 'middle', 'font-size': 12 });
  const pacRows = rows.filter(isPAC), baselineRows = rows.filter((r) => !isPAC(r));
  for (const row of [...baselineRows, ...pacRows]) {
    const values = row[dataset], xv = x(values.error[0]), yv = y(values[metric][0]);
    const color = familyColor(row);
    const group = add(svg, 'g', { class: 'plot-point', tabindex: '0', role: 'button', 'aria-label': `${row.method}, ${row.score}. Mean loss ${values.error[0]}, ${metric === 'stp' ? 'tokens saved' : 'expert calls'} ${values[metric][0]} percent. Select for standard deviations.`, 'data-id': row.id });
    const bars = add(group, 'g', { class: 'uncertainty', stroke: color, 'stroke-width': 1.2, 'pointer-events': 'none' });
    const xlo = clampX(values.error[0] - values.error[1]), xhi = clampX(values.error[0] + values.error[1]);
    const ylo = clampY(values[metric][0] - values[metric][1]), yhi = clampY(values[metric][0] + values[metric][1]);
    add(bars, 'path', { d: `M${xlo},${yv}H${xhi}M${xlo},${yv - 3}v6M${xhi},${yv - 3}v6M${xv},${ylo}V${yhi}M${xv - 3},${ylo}h6M${xv - 3},${yhi}h6`, fill: 'none' });
    add(group, 'circle', { cx: xv, cy: yv, r: 15, fill: 'transparent' });
    add(group, 'circle', { cx: xv, cy: yv, r: 13, fill: color, 'fill-opacity': .1, stroke: color, 'stroke-opacity': .4, 'stroke-width': 1, class: 'point-ring' });
    if (row.score === 'Verbalized') add(group, 'rect', { x: xv - 4.5, y: yv - 4.5, width: 9, height: 9, fill: color, stroke: colors.paper, 'stroke-width': 1.5 });
    else if (row.score === '—') add(group, 'path', { d: `M${xv},${yv - 6}l6,6 -6,6 -6,-6Z`, fill: color, stroke: colors.paper, 'stroke-width': 1.5 });
    else add(group, 'circle', { cx: xv, cy: yv, r: isPAC(row) ? 6 : 4.5, fill: color, stroke: colors.paper, 'stroke-width': 1.5 });
    add(group, 'title', {}, `${row.method} · ${row.score}`);
    if (isPAC(row)) {
      const verbal = row.score === 'Verbalized';
      const text = compact ? (verbal ? 'PAC · V' : 'PAC · L') : (verbal ? 'PAC · verbalized' : 'PAC · logits');
      const labelWidth = text.length * (compact ? 5.5 : 6);
      const placeLeft = verbal && xv - labelWidth - 12 >= left;
      const labelX = placeLeft ? xv - 12 : Math.min(right - labelWidth, xv + 12);
      label(group, labelX, yv + (verbal ? 23 : -14), text, { fill: color, 'font-size': 11, 'font-weight': 600, 'text-anchor': placeLeft ? 'end' : 'start', stroke: colors.paper, 'stroke-width': 4, 'stroke-linejoin': 'round', 'paint-order': 'stroke' });
    }
    group.addEventListener('mouseenter', () => showDetail(row));
    group.addEventListener('focus', () => showDetail(row));
    group.addEventListener('click', () => showDetail(row));
    group.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); showDetail(row); } });
  }
  $('#plot-title').textContent = `${meta.name} · binary loss`;
  setMath($('#tolerance-label'), `\\epsilon = ${meta.epsilon},\\quad \\alpha = 0.05`);
  $('#table-caption').textContent = `Table 1 · ${meta.name} · mean ± SD over 100 runs`;
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
  $('#cost-detail').textContent = `${meta.name}: reported test-set cost drops from $${meta.cost.dollars[0].toFixed(2)} to $${meta.cost.dollars[1].toFixed(2)}, and total latency from ${(meta.cost.latency_s[0] / 1000).toFixed(1)}k s to ${(meta.cost.latency_s[1] / 1000).toFixed(1)}k s. Prices and setup are those used in the paper.`;
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
  $('#show-uncertainty').addEventListener('change', () => {
    $('#results-chart').classList.toggle('show-all-sd', $('#show-uncertainty').checked);
  });
}).catch(() => {
  $('#point-detail').textContent = 'The chart data could not load. Please reload, or use the full numerical table in the paper PDF.';
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
