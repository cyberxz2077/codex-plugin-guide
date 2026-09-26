# Codex 插件指南 · Codex Plugin Guide

[![中文](https://img.shields.io/badge/文档-中文-111111?style=flat-square)](#中文说明) [![English](https://img.shields.io/badge/Docs-English-666666?style=flat-square)](#english)

> 面向 Codex 用户的独立插件目录与使用指南。非 OpenAI 官方项目。
>
> An independent directory and usage guide for Codex plugins. Not affiliated with OpenAI.

## 在线站点 · Live site

[打开 Codex 插件指南](https://codex-plugin-guide.cyberxz2077.chatgpt.site/)

> 网站已通过公开地址发布，可直接访问。
>
> The site is publicly available at the link above.

## 中文说明

### 这是什么

Codex 插件指南把 Codex 插件市场公开列出的全量目录整理成更容易理解的中文界面。每个条目保留官方名称和图标，并补充产品简介、插件构成、适合与不建议场景、最小验证任务、建议使用路径、官方说明和官方示例任务。首页重点展示的条目保留单独撰写的 Codex 适配判断；其余条目明确标注尚未逐项验证。

它的目标是帮助你先判断“这个插件是什么、在 Codex 中是否值得使用、应该怎样开始”，而不是简单罗列工具或给插件做无证据排名。

### 当前目录范围

- 覆盖官方插件市场全部 17 个分类展开页，包括三个专题分类；按页面实际展示的插件 ID 去重，不把本地缓存总量当作市场可见数量，也不把内部 Skill 或模板单独计数。
- 2026-09-26 可见全市场基线包含 3,550 个独立插件。缓存确认 3,528 个当前可用、16 个不可用；另 6 个已从官方详情页补齐，Codex 安装资格仍待确认。账号、地区和组织策略可能影响展示及安装资格。
- 「最新」在首次全量盘点时沿用 2026-08-28 至 2026-09-26 的首页陈列变化，不能等同于新上架；下一次全量盘点起才按全市场插件 ID 对比。
- [查看当前全部插件清单（名称、官网、中文简介）](docs/当前插件目录.md)。
- 中文模式优先展示官方说明与示例任务的中文译文；因翻译服务限流而暂缺译文的字段保留官方英文原文，并明确标注“翻译待补”。英文模式展示官方英文原文和英文界面。
- 支持分类筛选、关键词搜索、详情浮层、深色主题和安装 Prompt 生成。

### 本地运行

```bash
npm install
npm run dev
```

然后打开 <http://localhost:3000/>。

### 更新目录

先重新读取官方市场全部分类展开页的插件链接，更新 `scripts/visible-market-snapshot.json`（日期、来源和各分类 ID）。本地目录缓存只用来补充元数据，不能替代页面可见清单。缓存缺失的可见插件需要从官方详情页补入 `scripts/visible-market-supplement.json`，否则同步会报错，不会静默漏收。再运行：

```bash
node scripts/sync-catalog.mjs
node scripts/translate-market.mjs
node scripts/sync-market.mjs
node scripts/verify-market.mjs
```

首页的中文分类和介绍维护在 `scripts/catalog-translations.mjs`。全市场的中文说明与示例由翻译缓存生成，并保留官方英文原文。若只需更新首页的翻译缓存：

```bash
node scripts/fetch-translations.mjs
node scripts/sync-catalog.mjs
```

英文原文始终保留在生成目录中。全市场译文缓存位于 `scripts/market-translation-cache.json`。`docs/当前插件目录.md` 随全市场同步更新，官网链接仅采用目录中的官方字段，缺失时不会猜测。

### 验证

```bash
npm run lint
npm run build
npm audit --omit=dev
```

## English

### What it is

Codex Plugin Guide turns the full publicly listed Codex plugin marketplace into a more approachable Chinese-first directory. Each entry keeps its official name and icon, with a product overview, composition, suitable and unsuitable scenarios, a minimal verification task, a suggested workflow, the official description, and official example tasks. Homepage entries retain individually written Codex-fit notes; other entries are clearly marked as not individually assessed.

The goal is to answer three practical questions before installation: “What is this product?”, “Does it add value inside a Codex workflow?”, and “How should I start using it?” It is not a ranking or an official recommendation list.

### Catalog scope

- Covers all 17 expanded official marketplace category pages, including the three curated sections, deduplicated by visible plugin ID. Local cache totals are not treated as visitor-visible catalog counts. Bundled Skills and templates are not counted separately.
- The 2026-09-26 visitor-visible baseline has 3,550 distinct plugins. The cache confirms 3,528 available and 16 unavailable; six more were completed from official detail pages and still need Codex eligibility checks. Visibility and eligibility may vary by account, region, or organization.
- On the first full-market scan, “Latest” still reflects plugins newly shown between the 2026-08-28 and 2026-09-26 homepage snapshots, not newly released plugins. Future full-market scans compare plugin IDs against this baseline.
- [View the current complete catalog (name, official site, Chinese overview)](docs/当前插件目录.md).
- Chinese mode prefers translated official descriptions and example tasks. Fields still pending translation due to service rate limits retain the official English original and are marked accordingly. English mode shows the official originals.
- Includes category filters, keyword search, detail overlays, dark mode, and installation Prompt generation.

### Run locally

```bash
npm install
npm run dev
```

Then open <http://localhost:3000/>.

### Update the catalog

First read plugin links from every expanded official category page and update `scripts/visible-market-snapshot.json` with the date, source, and per-category IDs. Use the local catalog cache only for metadata, not to define visibility. Complete visible entries missing from the cache in `scripts/visible-market-supplement.json` using their official detail pages; synchronization fails rather than silently omitting them. Then run:

```bash
node scripts/sync-catalog.mjs
node scripts/translate-market.mjs
node scripts/sync-market.mjs
node scripts/verify-market.mjs
```

Chinese homepage labels are maintained in `scripts/catalog-translations.mjs`. To refresh only the homepage translation cache:

```bash
node scripts/fetch-translations.mjs
node scripts/sync-catalog.mjs
```

The generated catalog always keeps the official English source fields. Full-market Chinese translations are cached in `scripts/market-translation-cache.json`; the Markdown catalog is generated from the same data. Missing official website fields are not guessed.

### Verification

```bash
npm run lint
npm run build
npm audit --omit=dev
```
