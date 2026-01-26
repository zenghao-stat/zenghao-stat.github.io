import fs from 'node:fs/promises';
import path from 'node:path';

const args = new Set(process.argv.slice(2));
const check = args.has('--check');

const projectRoot = process.cwd();
const readmePath = path.join(projectRoot, 'README.md');
const appPath = path.join(projectRoot, 'src', 'App.tsx');
const contentPath = path.join(projectRoot, 'src', 'content.ts');
const packageJsonPath = path.join(projectRoot, 'package.json');

const START = '<!-- TRAE:README:AUTO:START -->';
const END = '<!-- TRAE:README:AUTO:END -->';

const pad2 = (n) => String(n).padStart(2, '0');

const extractConstStringArrayAt = (text, marker) => {
  const idx = text.indexOf(marker);
  if (idx < 0) return [];
  const endIdx = text.indexOf('] as const', idx);
  if (endIdx < 0) return [];
  const chunk = text.slice(idx, endIdx);
  const out = [];
  const re = /'([^']+)'/g;
  for (;;) {
    const m = re.exec(chunk);
    if (!m) break;
    out.push(m[1]);
  }
  return out;
};

const extractThemes = (text) => {
  const out = [];
  const re = /(\w+)\s*:\s*\{\s*id:\s*'([^']+)'\s*,\s*name:\s*'([^']+)'/g;
  for (;;) {
    const m = re.exec(text);
    if (!m) break;
    out.push({ key: m[1], id: m[2], name: m[3] });
  }
  const seen = new Set();
  return out.filter((x) => {
    if (seen.has(x.id)) return false;
    seen.add(x.id);
    return true;
  });
};

const extractNavItems = (text) => {
  const startIdx = text.indexOf('const navItems = [');
  if (startIdx < 0) return [];
  const endIdx = text.indexOf('];', startIdx);
  if (endIdx < 0) return [];
  const chunk = text.slice(startIdx, endIdx);
  const out = [];
  const re = /\{\s*label:\s*'([^']+)'\s*,\s*href:\s*'([^']+)'\s*\}/g;
  for (;;) {
    const m = re.exec(chunk);
    if (!m) break;
    out.push({ label: m[1], href: m[2] });
  }
  return out;
};

const extractNightWindow = (text) => {
  const m = /return\s+hour\s*>=\s*(\d+)\s*\|\|\s*hour\s*<\s*(\d+)/.exec(text);
  if (!m) return null;
  return { from: Number(m[1]), to: Number(m[2]) };
};

const extractInterfaceFields = (text, interfaceName) => {
  const re = new RegExp(`export\\s+interface\\s+${interfaceName}\\s*\\{([\\s\\S]*?)\\n\\}`, 'm');
  const m = re.exec(text);
  if (!m) return [];
  const body = m[1];
  const fields = [];
  const lineRe = /^\s*([A-Za-z_][\w]*)\??:\s*([^;]+);/gm;
  for (;;) {
    const lm = lineRe.exec(body);
    if (!lm) break;
    const full = lm[0];
    const optional = full.includes('?:');
    fields.push({ name: lm[1], type: lm[2].trim(), optional });
  }
  return fields;
};

const listJsonCount = async (relativePath) => {
  try {
    const abs = path.join(projectRoot, relativePath);
    const text = await fs.readFile(abs, 'utf8');
    const data = JSON.parse(text);
    if (Array.isArray(data)) return data.length;
    return 1;
  } catch {
    return null;
  }
};

const listDirSample = async (relativeDir, limit = 6) => {
  try {
    const abs = path.join(projectRoot, relativeDir);
    const items = await fs.readdir(abs);
    const visible = items.filter((x) => !x.startsWith('.')).sort();
    return { count: visible.length, sample: visible.slice(0, limit) };
  } catch {
    return { count: 0, sample: [] };
  }
};

const generateAutoMarkdown = async () => {
  const [appText, contentText, packageText] = await Promise.all([
    fs.readFile(appPath, 'utf8'),
    fs.readFile(contentPath, 'utf8'),
    fs.readFile(packageJsonPath, 'utf8'),
  ]);

  const pkg = JSON.parse(packageText);
  const themes = extractThemes(appText);
  const navItems = extractNavItems(appText);
  const yearFilters = extractConstStringArrayAt(appText, "(['2026'");
  const pubTypes = extractConstStringArrayAt(appText, "(['Journal'");
  const nightWindow = extractNightWindow(appText);

  const publicationsCount = await listJsonCount(path.join('src', 'publications.json'));
  const teachingCount = await listJsonCount(path.join('src', 'teaching.json'));
  const seminarsCount = await listJsonCount(path.join('src', 'seminars.json'));
  const talksCount = await listJsonCount(path.join('src', 'talks.json'));
  const serviceCount = await listJsonCount(path.join('src', 'academic_service.json'));

  const images = await listDirSample(path.join('public', 'images'));
  const papers = await listDirSample(path.join('public', 'papers'));
  const teachingPages = await listDirSample(path.join('public', 'teaching-and-seminar'));

  const profileFields = extractInterfaceFields(contentText, 'Profile');
  const publicationFields = extractInterfaceFields(contentText, 'Publication');
  const teachingFields = extractInterfaceFields(contentText, 'Teaching');
  const seminarFields = extractInterfaceFields(contentText, 'Seminar');
  const talkFields = extractInterfaceFields(contentText, 'Talk');
  const serviceItemFields = extractInterfaceFields(contentText, 'AcademicServiceItem');
  const serviceGroupFields = extractInterfaceFields(contentText, 'AcademicServiceGroup');

  const deps = Object.keys(pkg.dependencies ?? {}).sort();
  const devDeps = Object.keys(pkg.devDependencies ?? {}).sort();

  const lines = [];
  lines.push('由 `scripts/update-readme.mjs` 自动生成。');
  lines.push('');
  lines.push('### 站点结构（从 src/App.tsx 提取）');
  if (navItems.length) {
    lines.push(`- 导航：${navItems.map((x) => `${x.label}(${x.href})`).join(' / ')}`);
  } else {
    lines.push('- 导航：未解析到（请检查 src/App.tsx 的 navItems 结构是否变化）');
  }
  if (themes.length) {
    lines.push(`- 主题：${themes.map((x) => `${x.id}(${x.name})`).join(' / ')}`);
  } else {
    lines.push('- 主题：未解析到（请检查 src/App.tsx 的 THEMES 结构是否变化）');
  }
  if (nightWindow) {
    lines.push(`- Night 自动切换：${pad2(nightWindow.from)}:00–${pad2(nightWindow.to)}:00（本地时间）`);
  }
  if (pubTypes.length) {
    lines.push(`- Publications Type：${pubTypes.join(' / ')}`);
  }
  if (yearFilters.length) {
    lines.push(`- Publications Year：${yearFilters.join(' / ')}`);
  }
  lines.push('- Publications Topics：Any（并集）/ All（交集）');
  lines.push('');
  lines.push('### 数据文件（统计条目数）');
  lines.push(`- src/publications.json：${publicationsCount ?? 'unknown'} 条`);
  lines.push(`- src/teaching.json：${teachingCount ?? 'unknown'} 条`);
  lines.push(`- src/seminars.json：${seminarsCount ?? 'unknown'} 条`);
  lines.push(`- src/talks.json：${talksCount ?? 'unknown'} 条`);
  lines.push(`- src/academic_service.json：${serviceCount ?? 'unknown'} 个分组`);
  lines.push('- src/content.ts：Profile/News 的内容入口 + 全站类型定义');
  lines.push('');
  lines.push('### 静态资源（public/）');
  lines.push(`- public/images：${images.count} 个文件${images.sample.length ? `（例：${images.sample.join(', ')}）` : ''}`);
  lines.push(`- public/papers：${papers.count} 个文件${papers.sample.length ? `（例：${papers.sample.join(', ')}）` : ''}`);
  lines.push(`- public/teaching-and-seminar：${teachingPages.count} 个文件${teachingPages.sample.length ? `（例：${teachingPages.sample.join(', ')}）` : ''}`);
  lines.push('');
  lines.push('### 字段速查（从 src/content.ts 的 interface 提取）');
  const renderFields = (title, fields) => {
    lines.push('');
    lines.push(`#### ${title}`);
    if (!fields.length) {
      lines.push('- 未解析到（请检查 src/content.ts 的 interface 是否改名或结构变化）');
      return;
    }
    fields.forEach((f) => {
      lines.push(`- ${f.name}${f.optional ? '?' : ''}: ${f.type}`);
    });
  };
  renderFields('Profile', profileFields);
  renderFields('Publication', publicationFields);
  renderFields('Teaching', teachingFields);
  renderFields('Seminar', seminarFields);
  renderFields('Talk', talkFields);
  renderFields('AcademicServiceItem', serviceItemFields);
  renderFields('AcademicServiceGroup', serviceGroupFields);
  lines.push('');
  lines.push('### 依赖（从 package.json 提取）');
  lines.push('');
  lines.push(`- dependencies：${deps.length ? deps.join(', ') : '（空）'}`);
  lines.push(`- devDependencies：${devDeps.length ? devDeps.join(', ') : '（空）'}`);

  return lines.join('\n').trim() + '\n';
};

const main = async () => {
  const readme = await fs.readFile(readmePath, 'utf8');
  const startIdx = readme.indexOf(START);
  const endIdx = readme.indexOf(END);
  if (startIdx < 0 || endIdx < 0 || endIdx < startIdx) {
    throw new Error(`README 缺少自动同步标记：${START} 与 ${END}`);
  }

  const generated = await generateAutoMarkdown();
  const current = readme.slice(startIdx + START.length, endIdx).trim() + '\n';

  if (check) {
    if (current.trim() === generated.trim()) return;
    process.stderr.write('README 自动同步区块与当前代码不一致。请运行：npm run readme:update\n');
    process.exit(1);
  }

  const next =
    readme.slice(0, startIdx + START.length) +
    '\n\n' +
    generated +
    '\n' +
    readme.slice(endIdx);

  await fs.writeFile(readmePath, next, 'utf8');
};

main().catch((err) => {
  process.stderr.write(String(err?.stack ?? err) + '\n');
  process.exit(1);
});
