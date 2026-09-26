# Codex 插件指南 · Codex Plugin Guide

[![中文](https://img.shields.io/badge/文档-中文-111111?style=flat-square)](#中文说明) [![English](https://img.shields.io/badge/Docs-English-666666?style=flat-square)](#english) [![Website](https://img.shields.io/badge/Website-Open%20Guide-cbff57?style=flat-square)](https://codex-plugin-guide.cyberxz2077.chatgpt.site/)

先看懂插件是什么，再决定是否把它加入 Codex 工作流。

Understand a plugin before adding it to your Codex workflow.

**[访问网站 · Open the guide](https://codex-plugin-guide.cyberxz2077.chatgpt.site/)** · [完整插件清单 · Complete catalog](docs/当前插件目录.md)

## 中文说明

### 这个项目解决什么问题

插件名称和市场中的简短说明，往往不足以回答“这是什么产品”“为什么要在 Codex 中使用”“应该怎样开始”。本项目把官方插件目录整理为中文优先、可切换英文的使用指南，帮助你在安装前理解产品、检查插件构成和判断使用边界。

它覆盖全部分类展开页，而不只是首页的精选陈列。**目录可见不等于账号可安装，也不等于适合你的 Codex 任务。** 本项目不做无证据排名，不代替官方权限说明或产品文档。

### 可以做什么

- **查找插件**：按官方分类浏览，或按名称、用途搜索；「最新」位于「精选」前，显示两次盘点的时间范围。
- **理解产品**：卡片直接展示产品介绍；长介绍支持悬停或键盘聚焦展开，完整说明使用浮层，不挤动其他卡片。
- **判断用法**：查看使用类型、Codex 适配、App／Skill／模板构成、适合与不建议的场景、最小验证任务和建议使用路径。
- **核对官方资料**：查看官方说明、示例任务、官网链接和开发者；中文模式优先显示译文，英文模式保留官方原文。
- **生成安装 Prompt**：勾选插件并复制提示词回 Codex，先检查状态与权限，确认后再安装或授权。网站不会直接替你安装插件。
- **调整阅读界面**：支持浅色／深色主题、语言切换和最多五列的自适应卡片布局。

### 怎么使用

1. 打开 **[Codex 插件指南](https://codex-plugin-guide.cyberxz2077.chatgpt.site/)**，选择分类或搜索任务关键词。
2. 先读产品介绍，再打开完整说明，检查能力、账号要求和使用边界。
3. 点击 `＋` 加入安装清单，复制安装 Prompt 到 Codex。
4. 由 Codex 核对是否已安装、是否可用及所需权限；确认后再安装，先做最小验证任务。

### 数据范围与当前状态

以下数字是 **2026-09-26 的盘点快照**，不是实时统计：

- [官方插件市场](https://chatgpt.com/plugins)全部 **17 个分类展开页**，包括精选、新品与亮点、小型企业三个专题；按页面实际展示的插件 ID 去重，共 **3,550 个独立插件**。
- 专题分类与常规分类会重叠；插件内的 Skill 和模板不单独计数。本地缓存仅补充元数据，不用于直接定义市场可见数量。
- 缓存确认当前账号可用 3,528 个、不可用 16 个；另 6 个从官方详情页补齐，Codex 安装资格仍待确认。其他账号、地区或组织策略下的结果可能不同。
- 本次建立首次全市场基线。「最新」保留 **2026-08-28 至 2026-09-26** 的首页陈列变化，不是新上架日期；后续全市场盘点再按插件 ID 对比。
- 所有条目均有中文短简介和产品概述；仍有 **59 条官方完整说明、233 条官方示例任务**待补译，保留原文并标注“翻译待补”。
- 部分首页条目有单独撰写的适配说明，其余标注“未逐项验证”或“待核验”；收录不代表已安装、实测或推荐。

[完整 Markdown 清单](docs/当前插件目录.md)包含插件名、官网和中文简介，按 14 个常规分类去重列出。官方未提供官网的条目不会猜测补写。

### 本地运行

需要 **Node.js ≥ 22.13.0**。项目使用 npm 和已提交的 `package-lock.json`。

```bash
git clone https://github.com/cyberxz2077/codex-plugin-guide.git
cd codex-plugin-guide
npm ci
npm run dev
```

打开 <http://localhost:3000/>；端口被占用时，以终端显示的地址为准。技术栈为 React、Next.js App Router 与 Vinext，线上站点通过 Sites 托管。

### 维护与验证

目录是显式盘点的快照，网站不会自动实时扫描市场。更新时：

1. 读取全部官方分类展开页的插件链接，更新 `scripts/visible-market-snapshot.json` 的日期、来源和各分类 ID。
2. 使用 Codex 官方目录缓存补充元数据；缓存缺失的可见条目从官方详情页补入 `scripts/visible-market-supplement.json`。缺失元数据会导致同步报错，不会静默漏收。
3. 更新译文并生成网站数据和 Markdown，校验 ID 集合、分类数量及文档行数。

```bash
# 需要本机 Codex 目录缓存，或通过 CODEX_PLUGIN_CATALOG 指定目录 JSON
node scripts/translate-market.mjs
node scripts/sync-market.mjs
node scripts/verify-market.mjs

npx tsc --noEmit
npm run lint
npm run build
```

翻译脚本会将官方公开文案发送给外部翻译服务，可能受到限流；也可以直接维护 `scripts/market-translation-cache.json`。官网链接仅采用官方字段，不猜测补写。

`sync-catalog.mjs` 只更新首页快照，不能替代全分类盘点；它支持通过 `CODEX_PLUGIN_HOME_FEED` 读取已保存的首页 JSON。历史首页快照和编辑说明保存在 `app/catalog.generated.ts`。生成的网站数据位于 `public/catalog/`，完整清单位于 `docs/当前插件目录.md`，两者共用同一数据源。

欢迎通过 Issues 或 Pull Requests 提交错译、失效链接、遗漏条目和有证据的工作流经验。目录变更请附官方来源和盘点日期；实测结论请注明任务、环境及限制。

本项目为独立指南，非 OpenAI 官方项目。插件名称、图标及官方文案归各自权利人所有。

## English

[中文](#中文说明) · **[Open the website](https://codex-plugin-guide.cyberxz2077.chatgpt.site/)** · [Complete catalog](docs/当前插件目录.md)

### Why this project exists

A plugin name and a short marketplace description rarely explain what the underlying product is, why it belongs in a Codex workflow, or how to start safely. This project turns the official catalog into a Chinese-first guide with an English interface, product context, composition details, and workflow boundaries.

It covers every expanded category page, not just the homepage selection. **Being listed does not guarantee account eligibility or usefulness for a particular Codex task.** This is not a ranking, an official recommendation, or a substitute for product documentation and permission checks.

### Features

- **Discover plugins** by official category, product name, or use case. “Latest” appears before “Featured” and shows the comparison period.
- **Understand the product** directly on its card. Long overviews expand on hover or keyboard focus; full details open in an overlay without moving neighboring cards.
- **Evaluate the workflow** through usage type, Codex-fit notes, App／Skill／template composition, suitable and unsuitable scenarios, a minimal verification task, and a suggested usage path.
- **Check official material** including descriptions, example tasks, website links, and developer names. Chinese mode prefers translations; English mode preserves the official source copy.
- **Generate an installation prompt** from selected plugins. Paste it into Codex to check installation status, eligibility, and permissions before confirming installation or authorization. The website does not install plugins itself.
- **Customize reading** with light／dark themes, a language switch, and a responsive layout capped at five columns.

### Getting started

1. Open **[Codex Plugin Guide](https://codex-plugin-guide.cyberxz2077.chatgpt.site/)** and browse a category or search for your task.
2. Read the overview, then open full details to check capabilities, account requirements, and limitations.
3. Click `＋` to add plugins to your list and copy the installation prompt into Codex.
4. Let Codex check existing installations, eligibility, and permissions. Confirm before installation, then run a minimal verification task.

### Scope and status

These figures describe the **September 26, 2026 snapshot**, not a live count:

- All **17 expanded category pages** of the [official marketplace](https://chatgpt.com/plugins), including Featured, New & Noteworthy, and Small Business, produce **3,550 distinct plugin IDs**.
- Curated categories overlap with regular categories. Bundled Skills and templates are not counted separately. The local cache supplies metadata, not the definition of visitor-visible scope.
- The cache confirms 3,528 available and 16 unavailable for the scanned account. Six more entries were completed from official detail pages and still need Codex eligibility checks. Results can differ by account, region, or organization policy.
- This scan establishes the first full-market baseline. “Latest” retains homepage changes between **August 28 and September 26, 2026**, not release dates. Subsequent full-market scans compare plugin IDs.
- Every entry has a Chinese short summary and overview. **59 official descriptions and 233 example tasks** remain untranslated; their source copy is retained and marked as pending translation.
- Some homepage entries have individually written fit notes. Other entries are explicitly marked as unverified. Inclusion does not mean a plugin has been installed, tested, or recommended.

The [complete Markdown catalog](docs/当前插件目录.md) lists names, official websites, and Chinese overviews once across the 14 regular categories. Missing official website fields are not guessed.

### Run locally

Requires **Node.js ≥ 22.13.0**. The project uses npm with a committed `package-lock.json`.

```bash
git clone https://github.com/cyberxz2077/codex-plugin-guide.git
cd codex-plugin-guide
npm ci
npm run dev
```

Open <http://localhost:3000/> or the address printed by the terminal if that port is occupied. Built with React, the Next.js App Router, and Vinext; the public website is hosted through Sites.

### Maintenance and verification

The catalog is an explicitly scanned snapshot, not an automatic live feed:

1. Read plugin links from every expanded official category page and update the date, source, and per-category IDs in `scripts/visible-market-snapshot.json`.
2. Use the Codex catalog cache for metadata. Complete missing visible entries from their official detail pages in `scripts/visible-market-supplement.json`. Synchronization fails rather than silently omitting entries with missing metadata.
3. Update translations, generate the site data and Markdown, and verify ID coverage, category counts, and document rows.

```bash
# Requires a local Codex catalog cache, or CODEX_PLUGIN_CATALOG pointing to catalog JSON
node scripts/translate-market.mjs
node scripts/sync-market.mjs
node scripts/verify-market.mjs

npx tsc --noEmit
npm run lint
npm run build
```

The translation script sends public official copy to an external translation service and may be rate-limited. You can maintain `scripts/market-translation-cache.json` directly instead. Official website fields are not guessed.

`sync-catalog.mjs` refreshes only the homepage snapshot; it does not replace a full category scan. It accepts saved homepage JSON through `CODEX_PLUGIN_HOME_FEED`. Historical homepage data and editorial notes are in `app/catalog.generated.ts`. Generated site data is in `public/catalog/`, and the complete list is in `docs/当前插件目录.md`; both share the same data source.

Issues and Pull Requests for translation corrections, broken links, missing entries, and evidence-backed workflow notes are welcome. Include an official source and scan date for catalog changes, and the task, environment, and limitations for testing claims.

This is an independent guide, not an official OpenAI project. Plugin names, icons, and official copy belong to their respective owners.
