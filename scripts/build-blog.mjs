import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import matter from 'gray-matter';
import MarkdownIt from 'markdown-it';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const dirs = {
  blog: path.join(projectRoot, 'content', 'blog'),
  teaching: path.join(projectRoot, 'content', 'teaching'),
  seminars: path.join(projectRoot, 'content', 'seminars'),
  talks: path.join(projectRoot, 'content', 'talks'),
};

const outputs = {
  blog: path.join(projectRoot, 'public', 'blog'),
  teachingAndSeminar: path.join(projectRoot, 'public', 'teaching-and-seminar'),
  blogJson: path.join(projectRoot, 'src', 'blog.json'),
  teachingJson: path.join(projectRoot, 'src', 'teaching.json'),
  seminarsJson: path.join(projectRoot, 'src', 'seminars.json'),
  talksJson: path.join(projectRoot, 'src', 'talks.json'),
};

const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
});

const escapeHtml = (value = '') =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const ensureString = (value, fieldName, fileName) => {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${fileName} 的 front matter 缺少有效字段：${fieldName}`);
  }
  return value.trim();
};

const ensureOptionalString = (value) =>
  typeof value === 'string' && value.trim() ? value.trim() : undefined;

const ensureDateString = (value, fieldName, fileName) => {
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  throw new Error(`${fileName} 的 front matter 缺少有效字段：${fieldName}`);
};

const ensureBoolean = (value, defaultValue = true) =>
  typeof value === 'boolean' ? value : defaultValue;

const ensureStringArray = (value) => {
  if (!Array.isArray(value)) return [];
  return value.filter((item) => typeof item === 'string' && item.trim()).map((item) => item.trim());
};

const countCharacters = (html) => {
  const plainText = html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-zA-Z0-9#]+;/g, ' ')
    .replace(/\s+/g, '');
  return Array.from(plainText).length;
};

const formatCharacterCount = (count) => `${new Intl.NumberFormat('en-US').format(count)} chars`;

const extractPlainText = (html) =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-zA-Z0-9#]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const deriveExcerpt = (html, maxLength = 180) => {
  const plainText = extractPlainText(html);
  if (plainText.length <= maxLength) return plainText;
  return `${plainText.slice(0, maxLength).trimEnd()}…`;
};

const sortByUpdatedThenCreated = (items) =>
  items.sort((a, b) => {
    const primary = (b.updatedAt ?? b.date).localeCompare(a.updatedAt ?? a.date);
    if (primary !== 0) return primary;
    return (b.createdAt ?? b.date).localeCompare(a.createdAt ?? a.date);
  });

const sortByDate = (items) => items.sort((a, b) => b.date.localeCompare(a.date));

const listMarkdownFiles = async (dirPath) =>
  (await fs.readdir(dirPath))
    .filter((fileName) => fileName.endsWith('.md'))
    .sort();

const clearHtmlFiles = async (dirPath) => {
  await fs.mkdir(dirPath, { recursive: true });
  const files = await fs.readdir(dirPath);
  await Promise.all(
    files
      .filter((fileName) => fileName.endsWith('.html'))
      .map((fileName) => fs.rm(path.join(dirPath, fileName)))
  );
};

const renderShellStyles = () => `
      @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Newsreader:opsz,wght@6..72,400;6..72,700&display=swap');
      :root {
        color-scheme: light dark;
        --bg: #fbf7ef;
        --bg-panel: rgba(255, 255, 255, 0.82);
        --text: #1f2937;
        --muted: #5b6472;
        --line: rgba(31, 41, 55, 0.12);
        --accent: #1d4ed8;
        --accent-soft: rgba(29, 78, 216, 0.1);
      }
      @media (prefers-color-scheme: dark) {
        :root {
          --bg: #0f172a;
          --bg-panel: rgba(15, 23, 42, 0.82);
          --text: #e5edf8;
          --muted: #94a3b8;
          --line: rgba(148, 163, 184, 0.2);
          --accent: #7dd3fc;
          --accent-soft: rgba(125, 211, 252, 0.14);
        }
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        background:
          radial-gradient(circle at top left, rgba(29, 78, 216, 0.12), transparent 28rem),
          radial-gradient(circle at bottom right, rgba(15, 118, 110, 0.14), transparent 26rem),
          var(--bg);
        color: var(--text);
        font-family: 'Instrument Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      }
      a { color: inherit; }
      .shell {
        width: min(76rem, calc(100vw - 2rem));
        margin: 0 auto;
        padding: 2rem 0 4rem;
      }
      .back {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--muted);
        text-decoration: none;
        font-size: 0.95rem;
        font-weight: 600;
      }
      .back:hover { color: var(--text); }
      .hero,
      .article,
      .aside-card,
      .post-card,
      .meta-card {
        border: 1px solid var(--line);
        background: var(--bg-panel);
        backdrop-filter: blur(14px);
        border-radius: 1.75rem;
      }
      .hero {
        display: grid;
        gap: 1.5rem;
        margin-top: 1.5rem;
        padding: clamp(1.5rem, 3vw, 2.5rem);
      }
      .eyebrow {
        color: var(--muted);
        font-size: 0.76rem;
        text-transform: uppercase;
        letter-spacing: 0.22em;
        font-weight: 700;
      }
      h1,
      h2,
      h3 {
        font-family: 'Newsreader', Georgia, serif;
        letter-spacing: -0.02em;
      }
      h1 {
        margin: 0;
        font-size: clamp(2.7rem, 7vw, 5.2rem);
        line-height: 0.95;
      }
      .lede {
        max-width: 48rem;
        color: var(--muted);
        font-size: 1.08rem;
        line-height: 1.85;
      }
      .meta {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem 1rem;
        color: var(--muted);
        font-size: 0.92rem;
      }
      .meta span {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
      }
      .tag-list {
        display: flex;
        flex-wrap: wrap;
        gap: 0.55rem;
        margin-top: 0.9rem;
      }
      .tag-chip {
        display: inline-flex;
        align-items: center;
        border: 1px solid var(--line);
        border-radius: 999px;
        padding: 0.35rem 0.8rem;
        font-size: 0.76rem;
        font-weight: 700;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: var(--muted);
        background: rgba(255, 255, 255, 0.36);
      }
      .grid {
        display: grid;
        gap: 1.5rem;
        margin-top: 1.75rem;
      }
      @media (min-width: 980px) {
        .grid {
          grid-template-columns: minmax(0, 1.65fr) minmax(19rem, 0.85fr);
          align-items: start;
        }
      }
      .article {
        padding: clamp(1.5rem, 3vw, 2.5rem);
      }
      .aside {
        display: grid;
        gap: 1rem;
      }
      .aside-card,
      .meta-card {
        padding: 1.2rem 1.2rem 1.3rem;
      }
      .aside-card h3,
      .meta-card h3 {
        margin: 0;
        font-size: 1rem;
        font-family: 'Instrument Sans', -apple-system, BlinkMacSystemFont, sans-serif;
        letter-spacing: 0;
      }
      .aside-card ul {
        margin: 0.9rem 0 0;
        padding-left: 1.1rem;
      }
      .aside-card li,
      .aside-card p,
      .meta-card p {
        font-size: 0.94rem;
        color: var(--muted);
        line-height: 1.8;
      }
      .meta-rows {
        display: grid;
        gap: 0.65rem;
        margin-top: 0.9rem;
      }
      .meta-row {
        display: grid;
        grid-template-columns: 82px 1fr;
        gap: 0.65rem;
      }
      .meta-key {
        color: var(--muted);
        font-size: 0.84rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
      }
      .meta-value {
        color: var(--text);
        font-size: 0.95rem;
        line-height: 1.7;
      }
      .prose > :first-child {
        margin-top: 0;
      }
      .prose h2 {
        margin: 2.4rem 0 0.8rem;
        font-size: clamp(1.65rem, 3vw, 2.15rem);
        line-height: 1.05;
      }
      .prose h3 {
        margin: 1.6rem 0 0.65rem;
        font-size: 1.2rem;
      }
      .prose p {
        margin: 0.9rem 0;
        font-size: 1rem;
        line-height: 1.9;
        color: var(--text);
      }
      .prose a {
        color: var(--accent);
      }
      .prose ul,
      .prose ol {
        margin: 1rem 0;
        padding-left: 1.1rem;
      }
      .prose li {
        margin: 0.55rem 0;
        line-height: 1.8;
      }
      .prose blockquote {
        margin: 1.5rem 0;
        padding: 1rem 1.1rem;
        border-radius: 1.2rem;
        border: 1px solid var(--line);
        background: var(--accent-soft);
      }
      .prose blockquote p {
        color: var(--text);
      }
      .prose code {
        padding: 0.15rem 0.35rem;
        border-radius: 0.45rem;
        background: rgba(148, 163, 184, 0.18);
        font-size: 0.92em;
      }
      .prose pre {
        margin: 1.2rem 0;
        padding: 1rem 1.1rem;
        border-radius: 1rem;
        border: 1px solid var(--line);
        background: rgba(255, 255, 255, 0.38);
        overflow-x: auto;
      }
      .prose pre code {
        padding: 0;
        background: transparent;
      }
      @media (prefers-color-scheme: dark) {
        .prose pre {
          background: rgba(15, 23, 42, 0.45);
        }
      }
      .list {
        display: grid;
        gap: 1.2rem;
        margin-top: 1.6rem;
      }
      .post-card {
        padding: 1.5rem;
      }
      .post-meta,
      .post-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 0.65rem;
      }
      .post-meta {
        color: var(--muted);
        font-size: 0.86rem;
      }
      .post-card h2 {
        margin: 0.85rem 0 0;
        font-size: clamp(1.6rem, 3vw, 2.15rem);
        line-height: 1.08;
      }
      .post-card h2 a,
      .post-card h3 a {
        text-decoration: none;
      }
      .post-card h2 a:hover,
      .post-card h3 a:hover {
        color: var(--accent);
      }
      .post-excerpt {
        margin: 0.9rem 0 0;
        color: var(--muted);
        line-height: 1.8;
      }
      .post-tags {
        margin-top: 1rem;
      }
    `;

const renderBlogPostTemplate = (post, bodyHtml) => {
  const highlightsHtml = post.highlights.length
    ? `
          <section class="aside-card">
            <h3>Key points</h3>
            <ul>
              ${post.highlights.map((item) => `<li>${escapeHtml(item)}</li>`).join('\n              ')}
            </ul>
          </section>`
    : '';

  const tagsHtml = post.tags.length
    ? `
          <section class="aside-card">
            <h3>Tags</h3>
            <div class="tag-list">
              ${post.tags.map((tag) => `<span class="tag-chip">${escapeHtml(tag)}</span>`).join('\n              ')}
            </div>
          </section>`
    : '';

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(post.title)} — Hao Zeng</title>
    <style>
${renderShellStyles()}
    </style>
  </head>
  <body>
    <div class="shell">
      <a class="back" href="./list.html">← Back to blog</a>
      <header class="hero">
        <div class="eyebrow">Blog · ${escapeHtml(post.topic || 'Notes')} · updated ${escapeHtml(post.updatedAt)}</div>
        <h1>${escapeHtml(post.title)}</h1>
        <p class="lede">${escapeHtml(post.excerpt)}</p>
        <div class="meta">
          <span>Created: ${escapeHtml(post.createdAt)}</span>
          <span>Updated: ${escapeHtml(post.updatedAt)}</span>
          <span>Read size: ${escapeHtml(post.readTime)}</span>
          ${post.topic ? `<span>Topic: ${escapeHtml(post.topic)}</span>` : ''}
        </div>
      </header>
      <div class="grid">
        <article class="article">
          <div class="prose">
${bodyHtml}
          </div>
        </article>
        <aside class="aside">
${highlightsHtml}
${tagsHtml}
          <section class="aside-card">
            <h3>Source</h3>
            <p>This page is generated from a Markdown file during the project build flow.</p>
          </section>
        </aside>
      </div>
    </div>
  </body>
</html>
`;
};

const renderBlogListTemplate = (posts) => {
  const cardsHtml = posts
    .map(
      (post) => `        <article class="post-card">
          <div class="post-meta">
            <span>Created ${escapeHtml(post.createdAt)}</span>
            <span>Updated ${escapeHtml(post.updatedAt)}</span>
            <span>${escapeHtml(post.readTime)}</span>
          </div>
          <h2><a href="./${escapeHtml(post.id)}.html">${escapeHtml(post.title)}</a></h2>
          <p class="post-excerpt">${escapeHtml(post.excerpt)}</p>
          <div class="post-tags">
            ${post.tags.map((tag) => `<span class="tag-chip">${escapeHtml(tag)}</span>`).join('\n            ')}
          </div>
        </article>`
    )
    .join('\n');

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Blog — Hao Zeng</title>
    <style>
${renderShellStyles()}
    </style>
  </head>
  <body>
    <div class="shell">
      <a class="back" href="../">← Back to home</a>
      <section class="hero">
        <div class="eyebrow">Blog</div>
        <h1>Notes on AI, statistics, and reliable systems</h1>
        <p class="lede">Posts are listed in reverse chronological order by update time, then by create time. Each note can carry tags, create and update dates, and an automatic character-based read size.</p>
      </section>
      <section class="list">
${cardsHtml}
      </section>
    </div>
  </body>
</html>
`;
};

const renderAcademicDetailTemplate = (entry, bodyHtml) => {
  const tagsHtml = entry.tags.length
    ? `
          <section class="aside-card">
            <h3>Tags</h3>
            <div class="tag-list">
              ${entry.tags.map((tag) => `<span class="tag-chip">${escapeHtml(tag)}</span>`).join('\n              ')}
            </div>
          </section>`
    : '';

  const metaRows = [
    ['Category', entry.category],
    ['Type', entry.type],
    ['Role', entry.role],
    ['Venue', entry.venue],
    ['Location', entry.location],
    ['Date', entry.date],
    ['Semester', entry.semester],
  ]
    .filter(([, value]) => value)
    .map(
      ([label, value]) => `              <div class="meta-row">
                <div class="meta-key">${escapeHtml(label)}</div>
                <div class="meta-value">${escapeHtml(value)}</div>
              </div>`
    )
    .join('\n');

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(entry.title)} — Hao Zeng</title>
    <style>
${renderShellStyles()}
    </style>
  </head>
  <body>
    <div class="shell">
      <a class="back" href="../">← Back to home</a>
      <header class="hero">
        <div class="eyebrow">${escapeHtml(entry.category)}</div>
        <h1>${escapeHtml(entry.title)}</h1>
        <p class="lede">${escapeHtml(entry.excerpt)}</p>
      </header>
      <div class="grid">
        <article class="article">
          <div class="prose">
${bodyHtml}
          </div>
        </article>
        <aside class="aside">
          <section class="meta-card">
            <h3>Overview</h3>
            <div class="meta-rows">
${metaRows}
            </div>
          </section>
${tagsHtml}
        </aside>
      </div>
    </div>
  </body>
</html>
`;
};

const parseBlogPost = async (fileName) => {
  const filePath = path.join(dirs.blog, fileName);
  const raw = await fs.readFile(filePath, 'utf8');
  const parsed = matter(raw);
  const id = ensureOptionalString(parsed.data.id) || path.basename(fileName, path.extname(fileName));
  const title = ensureString(parsed.data.title, 'title', fileName);
  const createdAt = ensureDateString(parsed.data.createdAt, 'createdAt', fileName);
  const updatedAt = ensureDateString(parsed.data.updatedAt ?? parsed.data.createdAt, 'updatedAt', fileName);
  const topic = ensureOptionalString(parsed.data.topic);
  const tags = ensureStringArray(parsed.data.tags);
  const highlights = ensureStringArray(parsed.data.highlights);
  const body = parsed.content.trim();
  const bodyHtml = md.render(body);
  const excerpt = ensureOptionalString(parsed.data.excerpt) || deriveExcerpt(bodyHtml);

  return {
    id,
    title,
    createdAt,
    updatedAt,
    topic,
    tags,
    excerpt,
    readTime: formatCharacterCount(countCharacters(bodyHtml)),
    highlights,
    permalink: `/blog/${id}.html`,
    bodyHtml,
  };
};

const parseAcademicEntry = async (fileName, category) => {
  const dirPath = category === 'Teaching' ? dirs.teaching : dirs.seminars;
  const filePath = path.join(dirPath, fileName);
  const raw = await fs.readFile(filePath, 'utf8');
  const parsed = matter(raw);
  const id = ensureOptionalString(parsed.data.id) || path.basename(fileName, path.extname(fileName));
  const title = ensureString(parsed.data.title, 'title', fileName);
  const type = ensureString(parsed.data.type, 'type', fileName);
  const venue = ensureString(parsed.data.venue, 'venue', fileName);
  const date = ensureDateString(parsed.data.date, 'date', fileName);
  const role = ensureOptionalString(parsed.data.role) || '';
  const semester = ensureOptionalString(parsed.data.semester) || '';
  const location = ensureOptionalString(parsed.data.location) || '';
  const tags = ensureStringArray(parsed.data.tags);
  const body = parsed.content.trim();
  const bodyHtml = md.render(body);
  const excerpt = ensureOptionalString(parsed.data.excerpt) || deriveExcerpt(bodyHtml);

  return {
    id,
    category,
    title,
    type,
    role,
    venue,
    date,
    semester,
    excerpt,
    location,
    tags,
    body,
    permalink: `/teaching-and-seminar/${id}.html`,
    bodyHtml,
  };
};

const parseTalkEntry = async (fileName) => {
  const filePath = path.join(dirs.talks, fileName);
  const raw = await fs.readFile(filePath, 'utf8');
  const parsed = matter(raw);
  const id = ensureOptionalString(parsed.data.id) || path.basename(fileName, path.extname(fileName));
  const title = ensureString(parsed.data.title, 'title', fileName);
  const type = ensureString(parsed.data.type, 'type', fileName);
  const venue = ensureString(parsed.data.venue, 'venue', fileName);
  const date = ensureDateString(parsed.data.date, 'date', fileName);
  const location = ensureString(parsed.data.location, 'location', fileName);
  const show = ensureBoolean(parsed.data.show, true);
  const summary = ensureOptionalString(parsed.data.summary);
  const tags = ensureStringArray(parsed.data.tags);

  return {
    id,
    title,
    type,
    venue,
    date,
    location,
    show,
    summary,
    tags,
  };
};

const writeJson = (filePath, data) => fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');

const main = async () => {
  await clearHtmlFiles(outputs.blog);
  await clearHtmlFiles(outputs.teachingAndSeminar);

  const blogPosts = sortByUpdatedThenCreated(await Promise.all((await listMarkdownFiles(dirs.blog)).map(parseBlogPost)));
  const teachingEntries = sortByDate(await Promise.all((await listMarkdownFiles(dirs.teaching)).map((fileName) => parseAcademicEntry(fileName, 'Teaching'))));
  const seminarEntries = sortByDate(await Promise.all((await listMarkdownFiles(dirs.seminars)).map((fileName) => parseAcademicEntry(fileName, 'Seminar'))));
  const talkEntries = sortByDate(await Promise.all((await listMarkdownFiles(dirs.talks)).map(parseTalkEntry)));

  await Promise.all(
    blogPosts.map((post) =>
      fs.writeFile(path.join(outputs.blog, `${post.id}.html`), renderBlogPostTemplate(post, post.bodyHtml), 'utf8')
    )
  );
  await fs.writeFile(path.join(outputs.blog, 'list.html'), renderBlogListTemplate(blogPosts), 'utf8');

  const academicEntries = [...teachingEntries, ...seminarEntries];
  await Promise.all(
    academicEntries.map((entry) =>
      fs.writeFile(
        path.join(outputs.teachingAndSeminar, `${entry.id}.html`),
        renderAcademicDetailTemplate(entry, entry.bodyHtml),
        'utf8'
      )
    )
  );

  await writeJson(
    outputs.blogJson,
    blogPosts.map(({ bodyHtml, ...post }) => post)
  );
  await writeJson(
    outputs.teachingJson,
    teachingEntries.map(({ bodyHtml, ...entry }) => entry)
  );
  await writeJson(
    outputs.seminarsJson,
    seminarEntries.map(({ bodyHtml, ...entry }) => entry)
  );
  await writeJson(outputs.talksJson, talkEntries);
};

main().catch((error) => {
  process.stderr.write(`${String(error?.stack ?? error)}\n`);
  process.exit(1);
});
