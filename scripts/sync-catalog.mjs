import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { categoryTranslations, descriptionTranslations } from './catalog-translations.mjs';

const endpoint = 'https://chatgpt.com/backend-api/ps/plugins/home';
const feedPath = process.env.CODEX_PLUGIN_HOME_FEED;
let source;
if (feedPath) {
  source = JSON.parse(await readFile(feedPath, 'utf8'));
} else {
  const response = await fetch(endpoint);
  if (!response.ok) throw new Error(`Plugin catalog request failed: ${response.status}`);
  source = await response.json();
}
const detailCatalogCandidates = [
  process.env.CODEX_PLUGIN_CATALOG,
  '/Users/Zhuanz/.codex/cache/remote_plugin_catalog/0732e9d249a47a68.json',
].filter(Boolean);
let detailMap = new Map();
for (const candidate of detailCatalogCandidates) {
  try {
    const detailSource = JSON.parse(await readFile(candidate, 'utf8'));
    detailMap = new Map((detailSource.plugins ?? []).map((plugin) => [plugin.id, plugin]));
    break;
  } catch {
    // The public home feed remains sufficient when the local detail cache is absent.
  }
}
let translationMap = {};
try {
  translationMap = JSON.parse(await readFile(new URL('./catalog-translation-cache.json', import.meta.url), 'utf8'));
} catch {
  // The catalog can still be generated before the optional translation cache exists.
}
const assetsDir = new URL('../public/plugin-icons/', import.meta.url);
await mkdir(assetsDir, { recursive: true });

const unique = new Map();
for (const section of source.sections) {
  for (const plugin of section.plugins) unique.set(plugin.id, plugin);
}

const iconPaths = new Map();
await Promise.all([...unique.values()].map(async (plugin) => {
  const iconResponse = await fetch(plugin.icon_url);
  if (!iconResponse.ok) throw new Error(`Icon request failed for ${plugin.display_name}`);
  const contentType = iconResponse.headers.get('content-type') ?? '';
  const extension = contentType.includes('svg') ? 'svg' : contentType.includes('webp') ? 'webp' : contentType.includes('jpeg') ? 'jpg' : 'png';
  const filename = `${plugin.id.replace(/[^a-zA-Z0-9_-]/g, '-')}.${extension}`;
  await writeFile(new URL(filename, assetsDir), Buffer.from(await iconResponse.arrayBuffer()));
  iconPaths.set(plugin.id, `/plugin-icons/${filename}`);
}));

const editorialOverrides = {
  base44: {
    codexFit: '跨工具时适合',
    codexFitEn: 'Useful for cross-tool workflows',
    overlap: '高',
    overlapEn: 'High',
    bestFor: '已有 Base44 项目的远程开发、调试、预览和验证；或需要把本地代码、GitHub、设计资料与 Base44 串起来的任务。',
    bestForEn: 'Remote development, debugging, preview, and verification for an existing Base44 project, or workflows that connect local code, GitHub, design references, and Base44.',
    notFor: '只想从一句话生成并托管一个应用；这类任务直接使用 Base44 通常更短。',
    notForEn: 'If you only want to generate and host an app from one sentence, using Base44 directly is usually shorter.',
    proofPrompt: '读取我的 Base44 项目结构，只报告页面、实体和后端函数，不修改、不部署。',
    proofPromptEn: 'Read my Base44 project structure and report only its pages, entities, and backend functions. Do not modify or deploy anything.',
    usagePathEn: ['Install the plugin', 'Inspect the included App and Skills', 'Connect accounts only when needed', 'Run a read-only verification', 'Allow writes or deployment only after reviewing the result'],
  },
};

const productIntroOverrides = {
  gmail: {
    zh: 'Gmail 是 Google 提供的电子邮件服务，支持收发邮件、搜索历史、整理收件箱和管理邮件线程；在 Codex 中适合处理需要读取或起草邮件的工作。',
    en: 'Gmail is Google’s email service for sending, receiving, searching, and organizing messages; in Codex it is useful when a task needs inbox context or draft replies.',
  },
  github: {
    zh: 'GitHub 是面向软件开发的代码托管与协作平台，围绕代码仓库、Issue、Pull Request 和 CI/CD 组织团队工作；在 Codex 中适合检查代码、审查变更和跟进工程任务。',
    en: 'GitHub is a code-hosting and collaboration platform built around repositories, issues, pull requests, and CI/CD; in Codex it is useful for inspecting code, reviewing changes, and following up on engineering work.',
  },
  'google drive': {
    zh: 'Google Drive 是 Google 的云端文件与协作空间，集中保存并共享文档、表格、演示文稿及其他文件；在 Codex 中适合检索资料、整理文件和提炼文档内容。',
    en: 'Google Drive is Google’s cloud file and collaboration space for storing and sharing documents, spreadsheets, presentations, and other files; in Codex it is useful for finding source material and organizing documents.',
  },
  'google calendar': {
    zh: 'Google 日历是 Google 的日程管理服务，用来安排事件、查看空闲时间并协调会议；在 Codex 中适合把任务要求转成可执行的日程安排。',
    en: 'Google Calendar is Google’s scheduling service for events, availability, and meetings; in Codex it is useful for turning task requirements into an executable schedule.',
  },
  notion: {
    zh: 'Notion 是集文档、知识库、数据库和项目协作于一体的工作空间；在 Codex 中适合检索团队背景、整理研究和把决定沉淀成可复用的页面。',
    en: 'Notion is a workspace that combines documents, wikis, databases, and project collaboration; in Codex it is useful for retrieving context, structuring research, and turning decisions into reusable pages.',
  },
  slack: {
    zh: 'Slack 是一款将团队沟通、文件共享和各类办公工具整合在一起的协作软件，你可以把它理解为一个“数字总部”——工作相关的对话按项目或主题分到不同频道，历史记录会自动存档并可搜索。它还能连接 Google Drive 等外部工具，让沟通、看文件和协作集中在一个地方。Slack 于 2013 年发布，目前隶属于 Salesforce，是远程和混合办公中常见的团队协作平台；在 Codex 中适合检索频道信息、总结讨论和整理行动项。',
    en: 'Slack is a collaboration platform that brings team communication, file sharing, and workplace tools together. Think of it as a digital headquarters: work conversations are organized into project or topic channels, automatically archived, and searchable. It connects with tools such as Google Drive so teams can communicate, view files, and collaborate in one place. Launched in 2013, Slack is now part of Salesforce and is widely used by remote and hybrid teams; in Codex it is useful for retrieving channel context, summarizing discussions, and organizing action items.',
  },
  'outlook email': {
    zh: 'Outlook Email 是 Microsoft 的电子邮件服务，连接收件箱、联系人和邮件线程；在 Codex 中适合整理邮件、提取行动项和起草回复。',
    en: 'Outlook Email is Microsoft’s email service for inboxes, contacts, and message threads; in Codex it is useful for organizing mail, extracting action items, and drafting replies.',
  },
  canva: {
    zh: 'Canva 是面向非设计师与设计团队的在线视觉设计平台，提供模板、排版、图片和协作编辑能力；在 Codex 中适合把文字需求转成设计任务并迭代成品。',
    en: 'Canva is an online visual design platform for individuals and teams, with templates, layout, media, and collaborative editing; in Codex it is useful for turning written briefs into design work and iterating on the result.',
  },
  trello: {
    zh: 'Trello 是以看板、列表和卡片组织工作的项目管理工具，适合追踪任务状态、负责人和截止日期；在 Codex 中适合读取看板上下文并推动任务更新。',
    en: 'Trello is a project-management tool that organizes work with boards, lists, and cards for tracking status, owners, and due dates; in Codex it is useful for reading board context and moving tasks forward.',
  },
  'atlassian rovo': {
    zh: 'Atlassian Rovo 是 Atlassian 面向 Jira、Confluence 等工作内容提供的 AI 搜索与协作层；在 Codex 中适合跨项目检索背景、总结问题并串联后续行动。',
    en: 'Atlassian Rovo is Atlassian’s AI search and collaboration layer across work in Jira, Confluence, and related products; in Codex it is useful for retrieving cross-project context and connecting follow-up actions.',
  },
  'monday.com': {
    zh: 'monday.com 是用于项目、任务、流程和 CRM 的可配置工作管理平台；在 Codex 中适合查询项目进展、整理负责人和推动跨团队协作。',
    en: 'monday.com is a configurable work-management platform for projects, tasks, workflows, and CRM; in Codex it is useful for checking progress, organizing owners, and coordinating across teams.',
  },
  todoist: {
    zh: 'Todoist 是面向个人和团队的任务管理与计划工具，支持清单、优先级、提醒、日历视图和协作；在 Codex 中适合把自然语言目标整理成可执行任务。',
    en: 'Todoist is a task and planning tool for individuals and teams, with lists, priorities, reminders, calendar views, and collaboration; in Codex it is useful for turning natural-language goals into actionable tasks.',
  },
  figma: {
    zh: 'Figma 是基于云端的界面设计与原型协作平台，支持多人编辑、组件和设计交付；在 Codex 中适合读取设计上下文并把界面方案推进到代码。',
    en: 'Figma is a cloud-based interface design and prototyping platform for collaborative editing, components, and handoff; in Codex it is useful for reading design context and carrying interface work into code.',
  },
  supabase: {
    zh: 'Supabase 是提供 Postgres 数据库、认证、存储和实时能力的开发平台；在 Codex 中适合检查数据结构、查询数据并验证后端实现。',
    en: 'Supabase is a developer platform that provides Postgres databases, authentication, storage, and realtime features; in Codex it is useful for checking schemas, querying data, and verifying backend implementations.',
  },
  vercel: {
    zh: 'Vercel 是面向 Web 应用和 AI 应用的部署与托管平台，围绕预览、发布、域名和边缘基础设施组织开发流程；在 Codex 中适合检查部署状态并验证线上变更。',
    en: 'Vercel is a deployment and hosting platform for web and AI applications, centered on previews, releases, domains, and edge infrastructure; in Codex it is useful for checking deployments and verifying production changes.',
  },
  base44: {
    zh: 'Base44 是一个通过自然语言生成和托管全栈应用的平台，包含页面、数据实体、后端函数和部署能力；在 Codex 中更适合跨工具开发、调试和验证已有 Base44 项目，而不是给简单建站任务再套一层代理。',
    en: 'Base44 is a platform for generating and hosting full-stack apps from natural language, including pages, data entities, backend functions, and deployment; in Codex it is best used for cross-tool development, debugging, and verification of an existing Base44 project rather than wrapping a simple build in another agent.',
  },
};

function genericProductIntro(name, shortDescription, longDescriptionZh, language) {
  const short = String(shortDescription || '').replace(/[.!?。！？]+$/, '').trim();
  if (language === 'en') {
    const action = short ? short.charAt(0).toLowerCase() + short.slice(1) : 'working with this service';
    return `${name} is a service that helps you ${action}. In Codex, it is most useful when a task needs the service’s information or actions to be combined with reasoning, files, or other tools.`;
  }
  const action = String(descriptionTranslations[name] || short || '完成相关工作').replace(/[。！？]+$/, '');
  const detailLead = String(longDescriptionZh || '').split(/[。！？\n]/).map((part) => part.trim()).find(Boolean);
  const detail = detailLead && !detailLead.includes(action) ? ` 官方说明还提到：${detailLead}。` : '';
  return `${name} 是一款服务，主要帮助你${action}。${detail}在 Codex 中，它适合在需要读取该服务信息、调用其能力或把结果带回当前任务时使用。`;
}

function derivePluginMeta(plugin, detail) {
  const release = detail?.release ?? {};
  const manifestApps = Object.entries(release.app_manifest?.apps ?? {});
  const skills = release.skills ?? [];
  const templates = release.app_templates ?? [];
  const requiredApps = manifestApps.filter(([, app]) => app.required).map(([name]) => name);
  const optionalApps = manifestApps.filter(([, app]) => !app.required).map(([name]) => name);
  const displayAppName = (name) => /^(?:app|connector|asdk_app)[_-]/i.test(name) ? null : name;
  const requiredAppLabels = requiredApps.map(displayAppName).filter(Boolean);
  const optionalAppLabels = optionalApps.map(displayAppName).filter(Boolean);
  const hasApps = manifestApps.length > 0;
  const hasSkills = skills.length > 0;
  const hasTemplates = templates.length > 0;
  const pluginType = hasApps && hasSkills ? 'App + Skill' : hasApps ? 'App 连接器' : hasSkills ? 'Skill' : hasTemplates ? 'App 模板' : '组成待核验';
  const pluginTypeEn = hasApps && hasSkills ? 'App + Skill' : hasApps ? 'App connector' : hasSkills ? 'Skill' : hasTemplates ? 'App template' : 'Composition to verify';
  const usageType = hasApps && hasSkills ? '跨工具工作流' : hasSkills ? 'Codex 工作流' : hasApps ? '服务连接' : hasTemplates ? '应用模板' : '待核验';
  const usageTypeEn = hasApps && hasSkills ? 'Cross-tool workflow' : hasSkills ? 'Codex workflow' : hasApps ? 'Service connection' : hasTemplates ? 'App template' : 'To verify';
  const longText = `${plugin.display_name} ${release.interface?.long_description ?? plugin.short_description}`;
  const likelyPlatform = /(?:app builder|website builder|build (?:and host )?full-stack apps|build fully functional apps|deploy web apps|create,? refine,? and review designs|generate images? and videos?|create images? and video|presenter videos|create polished product marketing spots)/i.test(longText);
  const defaultFit = hasSkills && hasApps ? '跨工具时适合' : hasSkills ? '通常适合' : hasApps ? '按需使用' : '待核验';
  const defaultFitEn = hasSkills && hasApps ? 'Useful for cross-tool workflows' : hasSkills ? 'Usually a good fit' : hasApps ? 'Use when needed' : 'Needs verification';
  const defaultOverlap = likelyPlatform ? '高' : hasApps ? '中' : hasSkills ? '低' : '未知';
  const defaultOverlapEn = likelyPlatform ? 'High' : hasApps ? 'Medium' : hasSkills ? 'Low' : 'Unknown';
  const bestFor = hasSkills && hasApps
    ? '需要该服务资料或动作，同时希望 Codex 按既定 Skill 组织、执行和验证的重复工作流。'
    : hasSkills
      ? '有明确输入、输出和验收标准的重复性 Codex 工作流。'
      : hasApps
        ? '需要从该服务读取资料、查询状态或执行明确外部动作的任务。'
        : '先阅读官方说明，确认它是否提供 Codex 可直接使用的能力。';
  const notFor = hasApps
    ? '本地项目已经包含全部所需信息，或只是想在原平台完成一个单一步骤。'
    : hasSkills
      ? '目标模糊、没有验收标准，或只是希望 AI 凭空增加“创造力”的任务。'
      : '没有确认插件组成、账号要求和可验证结果之前直接安装。';
  const bestForEn = hasSkills && hasApps
    ? 'Repeatable workflows that need this service’s data or actions while Codex organizes, executes, and verifies the work.'
    : hasSkills
      ? 'Repeatable Codex workflows with clear inputs, outputs, and acceptance criteria.'
      : hasApps
        ? 'Tasks that need to read from this service, check its state, or perform a clearly scoped external action.'
        : 'Read the official description first and confirm that it exposes a capability Codex can use directly.';
  const notForEn = hasApps
    ? 'When the local project already contains everything needed, or you only want to complete one step inside the original platform.'
    : hasSkills
      ? 'Ambiguous goals without acceptance criteria, or tasks where you only want the AI to add vague “creativity”.'
      : 'Installing before confirming the plugin composition, account requirements, and a verifiable result.';
  const proofPrompt = hasApps
    ? `只读检查 ${plugin.display_name} 能访问的资料或能力，报告可用范围，不创建、不修改、不发送、不部署。`
    : hasSkills
      ? `使用 ${plugin.display_name} 的说明处理一个最小示例，只输出计划和验收标准，不修改文件。`
      : `先查看 ${plugin.display_name} 的官方说明，列出它在 Codex 中可用的能力和限制，不执行操作。`;
  const proofPromptEn = hasApps
    ? `Read-only check what ${plugin.display_name} can access or do, and report the available scope. Do not create, modify, send, or deploy anything.`
    : hasSkills
      ? `Use ${plugin.display_name} to process one minimal example. Output only a plan and acceptance criteria; do not modify files.`
      : `Read the official ${plugin.display_name} description first, list its capabilities and limits in Codex, and take no action.`;
  const usagePath = hasApps && hasSkills
    ? ['安装插件', '查看包含的 App 与 Skill', '按需连接账号', '先做只读验证', '确认结果后再允许写入或部署']
    : hasApps
      ? ['安装插件', '连接所需账号', '在 Codex 任务中选择插件', '先做只读验证', '确认后再执行外部写入']
      : hasSkills
        ? ['安装插件', '描述一个边界清楚的任务', '按 Skill 约定执行', '检查输出是否满足验收标准']
        : ['打开官方说明', '确认插件组成与使用表面', '先做最小只读验证'];
  const usagePathEn = hasApps && hasSkills
    ? ['Install the plugin', 'Inspect the included Apps and Skills', 'Connect accounts only when needed', 'Run a read-only verification', 'Allow writes or deployment only after reviewing the result']
    : hasApps
      ? ['Install the plugin', 'Connect the required account', 'Select the plugin in a Codex task', 'Run a read-only verification', 'Allow external writes only after confirmation']
      : hasSkills
        ? ['Install the plugin', 'Describe a clearly bounded task', 'Follow the Skill contract', 'Check the output against the acceptance criteria']
        : ['Open the official description', 'Confirm the plugin composition and surface', 'Run a minimal read-only verification'];
  return {
    pluginType,
    pluginTypeEn,
    usageType,
    usageTypeEn,
    requiredApps: requiredAppLabels,
    optionalApps: optionalAppLabels,
    skillNames: skills.map((skill) => skill.name),
    templateNames: templates.map((template) => template.name),
    requiredAppCount: requiredApps.length,
    optionalAppCount: optionalApps.length,
    skillCount: skills.length,
    templateCount: templates.length,
    codexFit: defaultFit,
    codexFitEn: defaultFitEn,
    overlap: defaultOverlap,
    overlapEn: defaultOverlapEn,
    bestFor,
    bestForEn,
    notFor,
    notForEn,
    proofPrompt,
    proofPromptEn,
    usagePath,
    usagePathEn,
  };
}

const sections = source.sections.map((section) => {
  const [titleZh, descriptionZh] = categoryTranslations[section.id] ?? [section.title, section.description];
  return {
    id: section.id,
    slug: section.url_slug,
    title: titleZh,
    titleEn: section.title,
    description: descriptionZh,
    descriptionEn: section.description,
    plugins: section.plugins.map((plugin) => ({
      ...(() => {
        const detailPlugin = detailMap.get(plugin.id);
        const detail = detailPlugin?.release?.interface;
        const meta = derivePluginMeta(plugin, detailPlugin);
        const override = editorialOverrides[plugin.display_name.toLowerCase()] ?? {};
        const longDescription = detail?.long_description ?? plugin.short_description;
        const longDescriptionZh = translationMap[longDescription] ?? longDescription;
        const defaultPrompts = detail?.default_prompts ?? [];
        const descriptionZh = descriptionTranslations[plugin.display_name] ?? plugin.short_description;
        const productOverride = productIntroOverrides[plugin.display_name.toLowerCase()] ?? {};
        return {
          developerName: detail?.developer_name ?? null,
          longDescription,
          longDescriptionZh,
          productIntro: productOverride.zh ?? genericProductIntro(plugin.display_name, descriptionZh, longDescriptionZh, 'zh'),
          productIntroEn: productOverride.en ?? genericProductIntro(plugin.display_name, plugin.short_description, longDescription, 'en'),
          websiteUrl: detail?.website_url ?? null,
          defaultPrompts,
          defaultPromptsZh: defaultPrompts.map((prompt) => translationMap[prompt] ?? prompt),
          keywords: detail?.keywords ?? plugin.keywords ?? [],
          ...meta,
          ...override,
        };
      })(),
      id: plugin.id,
      name: plugin.display_name,
      description: descriptionTranslations[plugin.display_name] ?? plugin.short_description,
      originalDescription: plugin.short_description,
      icon: iconPaths.get(plugin.id),
    })),
  };
});

const missing = [...unique.values()].filter((plugin) => !descriptionTranslations[plugin.display_name]);
if (missing.length) throw new Error(`Missing Chinese descriptions: ${missing.map((plugin) => plugin.display_name).join(', ')}`);

const generated = `// Generated by scripts/sync-catalog.mjs. Do not edit by hand.\n` +
  `export const catalogSource = ${JSON.stringify({
    endpoint,
    fetchedAt: new Date().toISOString(),
    sectionEntries: source.sections.reduce((sum, section) => sum + section.plugins.length, 0),
    uniquePlugins: unique.size,
    sections,
  }, null, 2)} as const;\n`;
await writeFile(new URL('../app/catalog.generated.ts', import.meta.url), generated);
console.log(`Synced ${source.sections.length} sections, ${unique.size} unique plugins.`);
