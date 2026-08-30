# Codex 插件指南 · Codex Plugin Guide

[![中文](https://img.shields.io/badge/文档-中文-111111?style=flat-square)](#中文说明) [![English](https://img.shields.io/badge/Docs-English-666666?style=flat-square)](#english)

> 面向 Codex 用户的独立插件目录与使用指南。非 OpenAI 官方项目。
>
> An independent directory and usage guide for Codex plugins. Not affiliated with OpenAI.

## 在线站点 · Live site

[打开 Codex 插件指南](https://codex-plugin-guide.cyberxz2077.chatgpt.site)

> 网站已通过公开地址发布，可直接访问。
>
> The site is publicly available at the link above.

## 中文说明

### 这是什么

Codex 插件指南把 Codex 插件首页的完整目录整理成更容易理解的中文界面。每个条目保留官方名称和图标，并补充产品简介、Codex 适配判断、插件构成、适合与不建议场景、最小验证任务、建议使用路径、官方说明和官方示例任务。

它的目标是帮助你先判断“这个插件是什么、在 Codex 中是否值得使用、应该怎样开始”，而不是简单罗列工具或给插件做无证据排名。

### 当前目录范围

- 按 Codex 插件首页的原生分类与顺序呈现。
- 当前快照包含 15 个分类、133 个分类条目。
- 跨分类去重后共有 130 个独立插件；插件内部的 Skill 不单独计数。
- 中文模式展示翻译后的官方说明与示例任务；英文模式展示官方英文原文和英文界面。
- 支持分类筛选、关键词搜索、详情浮层、深色主题和安装 Prompt 生成。

### 本地运行

```bash
npm install
npm run dev
```

然后打开 <http://localhost:3000/>。

### 更新目录

从当前 Codex 插件首页重新读取目录并生成数据：

```bash
node scripts/sync-catalog.mjs
```

中文分类和说明维护在 `scripts/catalog-translations.mjs`。如果官方说明或示例任务有新增，可先补齐翻译缓存，再重新同步：

```bash
node scripts/fetch-translations.mjs
node scripts/sync-catalog.mjs
```

英文原文始终保留在生成目录中，中文译文缓存位于 `scripts/catalog-translation-cache.json`。

### 验证

```bash
npm run lint
npm run build
npm audit --omit=dev
```

## English

### What it is

Codex Plugin Guide turns the complete Codex plugin homepage catalog into a more approachable bilingual interface. Each entry keeps the official name and icon, then adds a product overview, Codex-fit assessment, plugin composition, suitable and unsuitable scenarios, a smallest useful verification task, a suggested workflow, the official description, and official example tasks.

The goal is to answer three practical questions before installation: “What is this product?”, “Does it add value inside a Codex workflow?”, and “How should I start using it?” It is not a ranking or an official recommendation list.

### Catalog scope

- Follows the native categories and ordering of the Codex plugin homepage.
- The current snapshot contains 15 categories and 133 category entries.
- After cross-category deduplication, there are 130 distinct plugins. Skills bundled inside a plugin are not counted as separate plugins.
- Chinese mode shows translated official descriptions and example tasks; English mode shows the official English originals and an English interface.
- Includes category filters, keyword search, detail overlays, dark mode, and installation Prompt generation.

### Run locally

```bash
npm install
npm run dev
```

Then open <http://localhost:3000/>.

### Update the catalog

Read the current Codex plugin homepage catalog and regenerate the local data:

```bash
node scripts/sync-catalog.mjs
```

Chinese category labels and descriptions are maintained in `scripts/catalog-translations.mjs`. If the official descriptions or example tasks change, refresh the translation cache before syncing again:

```bash
node scripts/fetch-translations.mjs
node scripts/sync-catalog.mjs
```

The generated catalog always keeps the official English source fields. Chinese translations are cached in `scripts/catalog-translation-cache.json`.

### Verification

```bash
npm run lint
npm run build
npm audit --omit=dev
```
