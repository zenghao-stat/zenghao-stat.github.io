# zenghao-stat

一个基于 Vite + React 的学术个人主页单页项目，内容数据从 `src/*.json` 读取并在页面中渲染，支持主题切换与 Publications 多维筛选。

## 目录结构

- `src/App.tsx`: 主页面组件（布局、筛选逻辑、渲染）
- `src/content.ts`: 类型定义与内容聚合（从 JSON 导入并导出 `HAO_DATA`）
- `src/publications.json`: 论文数据
- `src/teaching.json`: 教学数据
- `src/talks.json`: 报告/展示数据（支持 `show` 字段控制展示）

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

## 数据字段说明

### Publications（`src/publications.json`）

- `title`/`authors`/`venue`/`type`/`year`：基础信息
- `selected`：是否为精选论文（用于 Selected/All 切换）
- `url`：如果存在且不为 `#`，标题会变为可点击的超链接
- `pdf`：如果存在且不为 `#`，会显示 PDF 链接按钮
- `code`：如果存在且不为 `#`，会显示 Code 链接按钮

### Talks（`src/talks.json`）

- `show`：可选字段；当 `show: false` 时该条不展示（默认展示）

## 功能概览

- 主题切换（Paper/Lab/Night）
- Publications 筛选：
  - Selected/All 切换
  - 类型筛选（Journal/Conference/Preprint/Software）
  - 年份筛选（2026/2025/2024/before 2024）
- Publications 展示：
  - 按 `year` 降序，其次 `id` 降序
  - 标题在有 `url` 时可点击并显示外链图标
  - 只在有数据时显示 PDF/Code

## TODO

- add abs 字段支持（在 `publications.json` 增加摘要字段并在页面展示/筛选）
- add keywords 字段支持（在 `publications.json` 增加关键字字段并在页面展示/筛选）

