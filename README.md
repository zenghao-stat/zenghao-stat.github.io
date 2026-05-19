# zenghao-stat.github.io

一个基于 Vite + React 的学术个人主页项目。站点主体是单页结构；所有推荐人工维护的内容都集中在 `content/` 文件夹，其中 `profile / news / publications / research / academic_service` 以 JSON 为源码，`blog / teaching / seminars / talks` 以 Markdown 为源码并自动生成 JSON 与静态页面。

- 在线地址：https://zenghao-stat.github.io/
- 部署方式：push 到 `master` 后，GitHub Actions 自动构建并发布到 GitHub Pages（见 `.github/workflows/pages.yml`）

---

## 技术栈与实现方式

- 构建：Vite + TypeScript
- 框架：React 18
- UI：Tailwind CSS（通过 `index.html` 引入 CDN 版本），图标来自 `lucide-react`
- 数据入口：`src/content.ts` 导出 `HAO_DATA`；它会聚合 `content/` 下的手工内容源，并读取由 Markdown 自动生成的 `src/blog.json`、`src/teaching.json`、`src/seminars.json`、`src/talks.json`

核心渲染逻辑集中在 [App.tsx](file:///Users/zengh/PAR/Resource/L04%20Profile%20%E4%B8%AA%E4%BA%BA%E6%A1%A3%E6%A1%88/academic_personal_website/zenghao-stat.github.io/src/App.tsx)。

---

## 本地预览项目（开发/生产两种方式）

### 1) 开发模式（推荐日常编辑时使用）

```bash
npm install
npm run dev -- --host 0.0.0.0 --port 5173
```

- 打开浏览器访问：`http://localhost:5173`
- 特点：保存代码后自动热更新（HMR）

### 2) 生产模式预览（接近 GitHub Pages 实际效果）

```bash
npm install
npm run build
npm run preview -- --host 0.0.0.0 --port 5173
```

- 打开浏览器访问：`http://localhost:5173`
- 特点：先构建 `dist/`，再以生产静态资源方式启动

## 自动同步区块（请勿手改）

下面区块由脚本根据当前代码与数据自动生成，用于“用 git 检查新增功能”和“自动同步 README”：

- 更新命令：`npm run readme:update`
- 一致性检查：`npm run readme:check`

<!-- TRAE:README:AUTO:START -->

由 `scripts/update-readme.mjs` 自动生成。

### 站点结构（从 src/App.tsx 提取）
- 导航：About(#about) / News(#news) / Research(#research) / Publications(#publications) / Teaching(#teaching) / Seminar(#seminar) / Talks(#talks) / Service(#service)
- 主题：paper(Paper) / lab(Lab) / mint(Mint) / brutal(Brutal) / night(Night)
- Night 自动切换：19:00–07:00（本地时间）
- Publications Type：Journal / Conference / Working Paper / Software / Patent
- Publications Year：2026 / 2025 / 2024 / before 2024
- Publications Topics：Any（并集）/ All（交集）

### 数据文件（统计条目数）
- content/profile.json：1 条
- content/news.json：5 条
- content/publications.json：32 条
- src/blog.json：1 条
- content/research.json：1 条 (Intro + Areas)
- src/teaching.json：5 条
- src/seminars.json：1 条
- src/talks.json：9 条
- content/academic_service.json：2 个分组
- src/content.ts：全站类型定义 + 数据聚合入口

### 静态资源（public/）
- public/images：2 个文件（例：profile.jpeg, research）
- public/papers：18 个文件（例：2024_Wan et al._Data‐driven estimation for multithreshold accelerated failure time model.pdf, 2025 - Zeng et al. - Robust Integrative Analysis via Quantile Regression with Homogeneity and Sparsity - Journal of Statistical Planning and Inference.pdf, 2405.15600.pdf, 2409.01236.pdf, 2501.18363.pdf, 2502.04037.pdf）
- public/blog：2 个文件（例：harness-on-ai.html, list.html）
- public/teaching-and-seminar：7 个文件（例：2019-fall-advanced-econometrics-i.html, 2021-fall-advanced-probability-theory.html, 2021-spring-real-analysis.html, 2022-fall-probability-introduction.html, 2022-spring-real-analysis.html, 2024-07-18-ml-theory-study-group.html）

### 字段速查（从 src/content.ts 的 interface 提取）

#### Profile
- name: string
- cnName?: string
- title: string
- university: string
- location: string
- description: string
- email: string
- googleScholar: string
- github: string
- siteUrl?: string
- cvUrl?: string
- teachingUrl?: string
- seminarsUrl?: string
- avatarUrl?: string

#### ResearchNarrativeItem
- text: string
- citations?: string[]

#### ResearchContent
- intro: ResearchNarrativeItem[]
- areas: ResearchArea[]

#### ResearchArea
- id: string
- title: string
- summary: string
- narrative: ResearchNarrativeItem[]
- imageUrl?: string

#### BlogPost
- id: string
- title: string
- createdAt: string
- updatedAt: string
- topic?: string
- tags?: string[]
- readTime?: string
- excerpt: string
- highlights?: string[]
- permalink?: string

#### Publication
- id: string
- title: string
- authors: string
- correspondingAuthors?: string[]
- firstAuthors?: string[]
- guidedStudents?: string[]
- venue: string
- type: 'Conference' | 'Journal' | 'Working Paper' | 'Software' | 'Patent'
- year: string
- month?: string
- abs?: string
- tag?: string[]
- keywords?: string[]
- pdf?: string
- code?: string
- url?: string
- selected?: boolean

#### Teaching
- id: string
- category?: string
- title: string
- type: string
- role: string
- venue: string
- date: string
- semester?: string
- excerpt?: string
- location?: string
- tags?: string[]
- body?: string
- permalink?: string

#### Seminar
- id: string
- category?: string
- title: string
- type: string
- role?: string
- venue: string
- date: string
- location?: string
- excerpt?: string
- semester?: string
- tags?: string[]
- body?: string
- permalink?: string

#### Talk
- id: string
- title: string
- type: string
- venue: string
- date: string
- location: string
- summary?: string
- tags?: string[]
- show?: boolean

#### AcademicServiceItem
- name: string
- note?: string
- year?: string[]

#### AcademicServiceGroup
- type: string
- items: AcademicServiceItem[]

### 依赖（从 package.json 提取）

- dependencies：gray-matter, lucide-react, markdown-it, react, react-dom
- devDependencies：@types/react, @types/react-dom, typescript, vite

<!-- TRAE:README:AUTO:END -->

---

## 网站包含哪些页面/区块（以及实现效果）

站点顶部导航是锚点跳转（`#about/#news/#publications/#teaching/#seminar/#talks/#service`），移动端有折叠菜单。

### 主题切换（样式）

- 主题：Paper / Lab / Mint / Brutal / Night
- 交互：
  - 点击调色板按钮循环切换；桌面端悬停可展开主题列表选择
  - 会把“偏好的浅色主题”存到浏览器 localStorage（key: `haozeng_theme`）
  - 夜间模式有“按时间自动切换”：本地时间 19:00–07:00 自动切到 Night；白天回到偏好的浅色主题

### About（头像 + 个人信息）

- 头像从 `HAO_DATA.profile.avatarUrl` 读取，通常指向 `public/images/...`
- 简介 `description` 支持用 `**加粗**` 做强调（实现上把 `**...**` 转成 `<strong>`）

### News（时间线）

- 以时间线样式展示 `HAO_DATA.news`
- `content` 同样支持 `**加粗**`，并带高亮底色
- `publicationIds` 可关联 Publications 的 `id`，显示为可点击 citation 编号

### Publications（论文列表 + 多维筛选）

- 展示排序：按 `year` 降序，其次按 `month` 降序（没有 `month` 视为 0），再按 `id` 降序
- 筛选器：
  - Selected / All 切换（统计数随筛选动态更新）
  - Type：Journal / Conference / Working Paper / Software / Patent
  - Year：2026 / 2025 / 2024 / before 2024（这是写死的按钮；更早年份会归入 “before 2024”）
  - Topics（由 `keywords` 自动汇总生成）：
    - Any：并集匹配（选中的任意关键词命中即可）
    - All：交集匹配（必须同时包含所有选中关键词）
- 条目效果：
  - 标题：当 `url` 存在且不为 `#` 时，标题变为外链
  - PDF / Code：当 `pdf` / `code` 存在且不为 `#` 时显示按钮
  - Abstract：桌面端支持悬停展开；移动端显示 “Abstract” 按钮点开
  - 作者标记（依赖作者名精确匹配）：
    - `firstAuthors`：作者后显示 †
    - `correspondingAuthors`：作者后显示信封图标
    - `guidedStudents`：作者后显示学生帽图标
  - 标签 `tag`：展示为小药丸；顶会/顶刊标签由 `src/App.tsx` 中的 `TOP_VENUE_RULES` 根据 `venue` 自动生成

### Teaching / Seminar（卡片列表 + 静态详情页）

- Teaching 与 Seminar 都以卡片网格展示（2 列响应式）
- 卡片标题会链接到静态详情页：
  - 链接规则：`/teaching-and-seminar/{id}.html`
  - 这些 HTML 文件位于：`public/teaching-and-seminar/`
- 摘要展示逻辑：优先展示 `excerpt`；否则展示 `body` 的第一段（用空行分段）

### Talks and Presentations（时间线）

- 按时间线展示 `src/talks.json`（由 `content/talks/*.md` 自动生成）
- `show: false` 的条目不会显示（默认显示）

### Academic Service（服务列表）

- 从 `content/academic_service.json` 读取分组（按 `type` 分两列）
- 每条 item 展示为：`name + year(可选)`；`note` 会作为鼠标悬停提示（title）

---

## 你可以修改哪些“元数据”（以及改了会发生什么）

### 快速索引：哪些建议自己改，哪些不要直接改

| 位置 | 影响的区块/效果 |
| --- | --- |
| `content/profile.json` | About 的姓名/学校/简介/头像/联系方式 |
| `content/news.json` | News 时间线内容 |
| `content/publications.json` | Publications 列表、排序、筛选、链接按钮、作者标记、标签、Topic 关键词 |
| `content/research.json` | Research 区块文案、图片与引用关系 |
| `content/academic_service.json` | Academic Service 分组与条目文案（含年份与悬停备注） |
| `content/blog/*.md` | Blog 文章源码、标签、`createdAt` / `updatedAt`、摘要、正文 |
| `content/teaching/*.md` | Teaching 卡片内容与对应详情页源码 |
| `content/seminars/*.md` | Seminar 卡片内容与对应详情页源码 |
| `content/talks/*.md` | Talks 时间线源码 |
| `public/images/*` | 头像等静态图片（通过 URL 引用） |
| `public/papers/*` | 论文 PDF 静态资源（配合 `pdf: "/papers/xxx.pdf"`） |

### 建议自己改的

- `content/profile.json`
  - About 的推荐编辑入口
- `content/news.json`
  - News 的推荐编辑入口
- `content/publications.json`
  - 论文列表主数据源，建议直接维护
- `content/research.json`
  - Research 主数据源，建议直接维护
- `content/academic_service.json`
  - Academic Service 主数据源，建议直接维护
- `content/blog/*.md`
  - Blog 的推荐编辑入口
- `content/teaching/*.md`
  - Teaching 的推荐编辑入口
- `content/seminars/*.md`
  - Seminar 的推荐编辑入口
- `content/talks/*.md`
  - Talks 的推荐编辑入口

### 最好不要直接改的

- `src/blog.json`
- `src/teaching.json`
- `src/seminars.json`
- `src/talks.json`
- `public/blog/*.html`
- `public/teaching-and-seminar/*.html`

这些文件现在都是 Markdown 构建产物。

每次运行下面这些命令前，都会先自动执行一次 `npm run blog:build`：

- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run readme:update`
- `npm run readme:check`

所以如果手改上面的 JSON 或 HTML，后续很容易被自动覆盖。

### 现在的推荐维护方式

- Blog：改 `content/blog/*.md`
- Teaching：改 `content/teaching/*.md`
- Seminar：改 `content/seminars/*.md`
- Talks：改 `content/talks/*.md`
- Publications：改 `content/publications.json`
- Research：改 `content/research.json`
- Academic Service：改 `content/academic_service.json`
- About：改 `content/profile.json`
- News：改 `content/news.json`

### 不在“元数据”里的内容（需要改代码）

下面这些目前不是从 JSON/`content.ts` 读取的，而是写在 [App.tsx](file:///Users/zengh/PAR/Resource/L04%20Profile%20%E4%B8%AA%E4%BA%BA%E6%A1%A3%E6%A1%88/academic_personal_website/zenghao-stat.github.io/src/App.tsx) 里：

- About 区域的座右铭（motto）固定字符串
- Research Interests 的两行内容固定字符串
- Publications 的 Year 筛选按钮（2026/2025/2024/before 2024）是写死的
- 顶部导航项的顺序与标题（About/News/...）是写死的

### Profile（`content/profile.json`）与 News（`content/news.json`）

Profile 位于 `HAO_DATA.profile`，常用字段：

- `name` / `cnName`：导航栏与 About 标题
- `title` / `university`：About 的职位与单位行
- `email`：Email 按钮（`mailto:`）
- `googleScholar` / `github`：外链按钮与页脚链接
- `avatarUrl`：头像图片地址（建议放 `public/images/`，然后写成 `./images/xxx.jpg` 或 `/images/xxx.jpg`）
- `description`：About 段落，支持 `**加粗**`

News 位于 `HAO_DATA.news: { date, content, publicationIds? }[]`：

- `date`：时间线左侧日期（展示为原字符串）
- `content`：新闻内容，支持 `**加粗**`（会带高亮底色）
- `publicationIds`：关联到 Publications 的 `id`，显示为可点击 citation 编号

### Publications（`content/publications.json`）

每条论文记录常用字段（与页面效果对应）：

- `id`：用于稳定排序（同年同月时作为最后的降序排序键），也作为 React key
- `title`：论文标题
- `authors`：作者字符串，按英文逗号 `,` 分割后逐个渲染；作者名需要与下述数组精确一致
- `venue`：期刊/会议/平台名称；已发表 conference 默认写完整 proceedings 名称并在末尾加简称，但会议全称不写年份，例如 `Proceedings of the 43rd International Conference on Machine Learning (ICML)`；submitted conference 也写完整会议名和简称，例如 `Submitted to The 40th Annual Conference on Neural Information Processing Systems (NeurIPS)`
- `type`：必须是 `Journal` / `Conference` / `Working Paper` / `Software` / `Patent` 之一（用于 Type 筛选和徽章颜色）
- `year`：年份（字符串），用于排序与 Year 筛选
- `month`：月份（字符串，如 `"09"`），用于同年内排序；缺省视为 0
- `selected`：是否属于 Selected 列表（Selected/All 切换）
- `url`：标题外链（不想显示外链可省略或写 `"#"`）
- `pdf`：PDF 链接（建议使用 `/papers/xxx.pdf`，并把文件放到 `public/papers/`）
- `code`：代码仓库/项目链接
- `abs`：摘要（桌面端悬停展开；移动端按钮展开）
- `keywords`：Topic 关键词数组
  - 会展示在条目里
  - 会进入 Topics 下拉筛选（Any/All）
- `tag`：标签（支持字符串或数组）
  - 会展示为小药丸
  - 普通标签可手动维护；`TOP AI`、`TOP Econometrics` 这类顶会/顶刊标签由 `src/App.tsx` 中的 `TOP_VENUE_RULES` 根据 `venue` 自动生成
- `firstAuthors`：作者名数组；命中者后显示 †
- `correspondingAuthors`：作者名数组；命中者后显示信封图标
- `guidedStudents`：作者名数组；命中者后显示学生帽图标

作者标记的一个关键点：页面会对 `authors` 中逗号分割得到的作者名 `trim()` 后，直接与 `firstAuthors/correspondingAuthors/guidedStudents` 内的字符串做全等比较，所以名字必须完全一致（空格、大小写都要一致）。

### Research（`content/research.json`）

Research 区块现在推荐直接维护 `content/research.json`。

- `intro`：顶部研究介绍段落数组
- `areas`：研究方向卡片数组
- `areas[].id`：卡片稳定标识
- `areas[].title`：方向标题
- `areas[].summary`：方向摘要
- `areas[].imageUrl`：配图路径
- `areas[].narrative`：研究叙述数组
- `areas[].narrative[].text`：正文
- `areas[].narrative[].citations`：关联到 Publications 的 `id`

如果你修改了 `citations`，要确保其中的论文 `id` 能在 `content/publications.json` 中找到。

### Teaching（`content/teaching/*.md` → `src/teaching.json`）与 Seminar（`content/seminars/*.md` → `src/seminars.json`）

请优先修改 Markdown 源文件，不要直接手改生成后的 `src/teaching.json`、`src/seminars.json` 或 `public/teaching-and-seminar/*.html`。

卡片展示依赖字段（来自 Markdown front matter）：

- `id`：详情页文件名（必须与 `public/teaching-and-seminar/{id}.html` 对应）
- `category`：生成时用于区分 Teaching / Seminar
- `title`：卡片标题与详情页标题
- `type`：卡片信息行
- `role`：Teaching 卡片会展示（Seminar 卡片目前不展示 role）
- `venue`：地点/单位行
- `location`：Seminar 卡片会在地点后追加展示（`venue • location`）
- `date`：卡片右上角只展示年份（取 `date.split('-')[0]`）
- `excerpt`：卡片摘要（优先）
- `body`：当 `excerpt` 为空时，用 `body` 的第一段作为卡片摘要
- `tags`：详情页侧边标签

新增 Teaching/Seminar 条目时，只需要补 Markdown；JSON 和静态详情页会自动生成：

- Markdown 源：`content/teaching/*.md` 或 `content/seminars/*.md`
- 生成 JSON：`src/teaching.json`、`src/seminars.json`
- 生成详情页：`public/teaching-and-seminar/{id}.html`

### Talks（`content/talks/*.md` → `src/talks.json`）

请优先修改 `content/talks/*.md`，不要直接手改 `src/talks.json`。

- `show`：`false` 时不展示（缺省或 `true` 会展示）
- `date`：时间线左侧展示为 `YYYY-MM`（取 `date.substring(0, 7)`）
- 其余字段：`title/type/venue/location` 直接展示
- `summary`、`tags`：当前主要作为内容元数据保留，便于后续扩展

### Academic Service（`content/academic_service.json`）

结构是分组数组：

- 组：`{ type: string, items: AcademicServiceItem[] }`
- item：`{ name: string, note?: string, year?: string[] }`

页面展示规则：

- 展示文字：`name` + `year`（如果有 year，会拼到名字后面，如 `AISTATS 2026`）
- 悬停提示：`note` 非空时作为 title（鼠标悬停可见）

---

## 静态资源与路径约定（避免 404）

- 头像等图片：放 `public/images/`，然后在 `avatarUrl` 使用 `/images/...` 或 `./images/...`
- 论文 PDF：推荐链接写成 `/papers/xxx.pdf`，对应文件放 `public/papers/`
  - 只放到 `dist/papers/` 会导致本地开发预览 404（Vite dev 只读取 `public/`）

---

## 本地运行

```bash
npm install
npm run dev
```

构建与预览：

```bash
npm run build
npm run preview
```

---

## 分支说明

- `master`：线上站点分支（GitHub Pages 自动部署）
- `academic_page`：历史版本备份分支（原 Jekyll 站点）
