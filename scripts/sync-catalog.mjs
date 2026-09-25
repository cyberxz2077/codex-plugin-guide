import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { categoryTranslations, descriptionTranslations } from './catalog-translations.mjs';

const endpoint = 'https://chatgpt.com/backend-api/ps/plugins/home';
const feedPath = process.env.CODEX_PLUGIN_HOME_FEED;
const generatedCatalogPath = new URL('../app/catalog.generated.ts', import.meta.url);
let previousCatalog = null;
try {
  previousCatalog = JSON.parse((await readFile(generatedCatalogPath, 'utf8'))
    .replace(/^.*?= /s, '').replace(/ as const;\s*$/, ''));
} catch {
  // The initial sync has no previous homepage snapshot to compare.
}
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
const icons = [...unique.values()];
for (let offset = 0; offset < icons.length; offset += 6) {
  await Promise.all(icons.slice(offset, offset + 6).map(async (plugin) => {
    let iconResponse;
    for (let attempt = 1; attempt <= 4; attempt++) {
      try {
        iconResponse = await fetch(plugin.icon_url);
        if (iconResponse.ok) break;
        throw new Error(`HTTP ${iconResponse.status}`);
      } catch (error) {
        if (attempt === 4) throw new Error(`Icon request failed for ${plugin.display_name}: ${error.message}`);
        await new Promise((resolve) => setTimeout(resolve, attempt * 400));
      }
    }
    const contentType = iconResponse.headers.get('content-type') ?? '';
    const extension = contentType.includes('svg') ? 'svg' : contentType.includes('webp') ? 'webp' : contentType.includes('jpeg') ? 'jpg' : 'png';
    const filename = `${plugin.id.replace(/[^a-zA-Z0-9_-]/g, '-')}.${extension}`;
    await writeFile(new URL(filename, assetsDir), Buffer.from(await iconResponse.arrayBuffer()));
    iconPaths.set(plugin.id, `/plugin-icons/${filename}`);
  }));
}

// The public homepage does not expose a website URL. Keep these verified
// first-party destinations only for records absent from the detail cache.
const websiteOverrides = {
  Gusto: 'https://gusto.com/',
  Ramp: 'https://ramp.com/',
  MyFitnessPal: 'https://www.myfitnesspal.com/',
  Finances: 'https://help.openai.com/en/articles/20001222-finances-in-chatgpt',
  Health: 'https://help.openai.com/en/articles/20001036-health-in-chatgpt',
};

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
  health: { zh: 'Health 是 ChatGPT 的健康数据连接与探索功能，可把个人健康资料带入对话。涉及敏感数据，应先确认账号资格、连接范围和隐私设置。' },
  exa: { zh: 'Exa 是面向 AI 应用的搜索引擎与网页内容接口，帮助 Agent 查找网页、提取内容并获取研究资料；在 Codex 中适合需要外部网页证据的任务。' },
  hubspot: { zh: 'HubSpot 是集 CRM、营销、销售和客户服务于一体的平台，用于管理客户资料与业务流程；在 Codex 中适合查询获授权的 CRM 数据并整理后续行动。' },
  stripe: { zh: 'Stripe 是在线支付与财务基础设施平台，帮助企业收款、管理订阅和查看收入；在 Codex 中适合处理有明确权限边界的支付与业务数据任务。' },
  shopify: { zh: 'Shopify 是电商建店与运营平台，可管理商品、订单、库存和销售渠道；在 Codex 中适合处理已有店铺的数据查询或明确的运营操作。' },
  'remote desktop commander': { zh: 'Remote Desktop Commander 通过用户授权的远程连接，让 Codex 查看另一台电脑的文件、执行终端命令并处理文档；适合确实需要跨设备操作的任务。' },
  'chatgpt ads manager': { zh: 'ChatGPT Ads Manager 是广告账户管理工具，可查看和调整广告活动、广告组、素材及效果数据；在 Codex 中适合围绕投放结果做分析和明确的运营操作。' },
  'stack overflow for agents': { zh: 'Stack Overflow For Agents 是面向 AI Agent 的技术知识交流网络。Agent 可以读取、回复和验证其他 Agent 分享的解决办法，用于减少重复排查。' },
  tableau: { zh: 'Tableau 是数据可视化与商业智能平台；其插件让 Codex 搜索工作簿和数据源、查询指标，并在获得授权后修改或发布可视化内容。' },
  'microsoft power bi': { zh: 'Microsoft Power BI 是微软的数据分析与报表平台。此插件通过本地浏览器操作报表、图表和仪表板，适合需要在现有 Power BI 环境中分析与制作内容的任务。' },
  data: { zh: 'Data 是 OpenAI 提供的数据分析插件，可连接已有数据仓库、商业智能工具与文档，调查业务指标变化，并把结果整理成图表、报表或建议。' },
  metricool: { zh: 'Metricool 是社交媒体管理平台，帮助团队分析账号表现、查看排期、寻找合适发布时间，并制作或更新社交媒体内容。' },
  inductive: { zh: 'Inductive 是 Inductive Bio 的药物发现工具，通过 ADMET 模型预测分子的吸收、分布、代谢、排泄和毒性相关性质，帮助研究人员筛选候选化合物。' },
  'aws data analytics': { zh: 'AWS Data Analytics 汇集 AWS 数据湖与分析工具的工作流，涉及 S3 Tables、Glue 和 Athena；在 Codex 中可辅助梳理数据资产、ETL 与查询任务。' },
  clickhouse: { zh: 'ClickHouse 是面向实时分析的数据库平台。插件可检查 ClickHouse Cloud 的组织、服务、表与备份，并执行只读 SQL 查询。' },
  firebase: { zh: 'Firebase 是 Google 的应用后端平台，提供数据库、身份认证、托管等服务；其插件让 Codex 配置项目、查询 Firestore、检查规则并协助部署。' },
  'thoughtspot spotter': { zh: 'ThoughtSpot Spotter 是自然语言数据分析助手，让业务团队对已连接的数据提问、追查指标变化并验证分析结果。' },
  dropbox: { zh: 'Dropbox 是云端文件存储与共享平台。插件可在 Codex 中查找文件、处理内容、保存生成结果或创建分享链接。' },
  gusto: { zh: 'Gusto 是面向企业的薪资与人事平台，处理发薪、员工资料和福利。插件可把这些数据带入 Codex，以便检查发薪变化和准备人事工作。' },
  wix: { zh: 'Wix 是在线建站平台，可生成、编辑和托管网站；在 Codex 中适合把内容与设计要求交给 Wix 建站流程处理。' },
  firecrawl: { zh: 'Firecrawl 是网页数据采集工具，可搜索网站、提取页面和文档内容，并进行多页抓取或结构化研究。' },
  invideo: { zh: 'invideo 是文本驱动的视频制作平台，把脚本、画面、配音和音乐整合为可分享的视频。' },
  'ai voice generator': { zh: 'AI Voice Generator 是文字转语音工具，可根据脚本生成自然配音并返回音频文件，适合旁白和口播素材制作。' },
  viewmax: { zh: 'Viewmax 是面向社交媒体的视频制作平台，可生成和编辑短视频、图片、配音、广告素材和字幕。' },
  railway: { zh: 'Railway 是应用部署平台，围绕项目、服务与运行状态管理开发环境；插件让 Codex 创建部署、检查性能并排查故障。' },
  render: { zh: 'Render 是云端应用托管平台。插件可查看服务、部署、日志和指标，也可管理数据库与环境变量。' },
  hatchable: { zh: 'Hatchable 是全栈应用托管平台，可配置数据库、部署后端函数并管理网站；适合已有应用需要发布和维护的流程。' },
  appdeploy: { zh: 'AppDeploy 帮助用户构建和发布 Web 应用，并管理版本、部署结果、后端密钥和自定义域名。' },
  lusha: { zh: 'Lusha 是 B2B 销售情报平台，提供公司资料、联系人和采购信号；插件适合在 Codex 中查询与整理潜在客户信息。' },
  highlevel: { zh: 'HighLevel 是面向代理商的 CRM 与营销自动化平台。插件可读取联系人、商机、预约和客户对话，辅助整理跟进工作。' },
  'helium 10': { zh: 'Helium 10 是面向亚马逊卖家的运营分析平台，可查询关键词、商品 ASIN、广告效果、利润和排名数据。' },
  amplitude: { zh: 'Amplitude 是产品分析平台，用事件、指标、实验和仪表板理解用户行为；插件让 Codex 查询这些数据并整理洞察。' },
  'blockscout blockchain data': { zh: 'Blockscout 是区块链浏览与数据平台，可查询多个 EVM 网络上的钱包、交易、代币、NFT 和智能合约信息。' },
  'rhythm ai personality tuner': { zh: 'Rhythm AI Personality Tuner 用一组偏好设置调整 ChatGPT 的沟通语气、详略和直接程度，更偏向对话体验配置。' },
  quizlet: { zh: 'Quizlet 是学习卡片平台，可把主题、笔记或文件转换为可复习的卡片集。' },
  'kahoot!': { zh: 'Kahoot! 是互动测验与课堂活动平台，可把主题、文档或链接生成可参与的选择题活动。' },
  wolfram: { zh: 'Wolfram 提供数学计算、算法和结构化知识数据；插件让 Codex 调用 Wolfram Language 与 Wolfram|Alpha 处理可计算的问题。' },
  rowan: { zh: 'Rowan 是计算化学与结构生物学平台，可运行分子性质、构象、反应路径和量子化学模拟。' },
  pendar: { zh: 'Pendar 是研究领域分析工具，可统计论文规模与增长趋势，识别主要学科、国家及值得优先阅读的论文。' },
  'ngs analysis workbench': { zh: 'NGS Analysis Workbench 面向二代测序分析，协助设计 FASTQ 质控、RNA-seq 和单细胞 RNA-seq 工作流，并与实际分析工具衔接。' },
  'genomic intelligence': { zh: 'Genomic Intelligence 提供 DNA 序列分析能力，可预测启动子、剪接位点、增强子、染色质状态和基因表达等特征。' },
  'toolcheck by m8ven': { zh: 'ToolCheck by M8ven 是 MCP 与软件包信任检查工具，可根据代码与行为证据评估连接风险。' },
  'neura relay mcp': { zh: 'Neura Relay MCP 在 Agent 执行动作前提供审核与记录能力，返回决策凭据和追踪信息，而不直接代替下游执行。' },
  'is it legit by m8ven': { zh: 'Is It Legit by M8ven 根据品牌名称或网址检查购物网站的信任信号，帮助用户识别可疑商家。' },
  finances: { zh: 'Finances 是 ChatGPT 的个人财务功能，可连接账户并汇总交易、支出、订阅、投资和负债信息。' },
  massive: { zh: 'Massive 是金融市场数据服务，可查询股票、期权、期货、指数、外汇与加密资产的实时和历史数据。' },
  'qbo connector by meridian': { zh: 'QBO Connector by Meridian 连接 QuickBooks Online，可按授权范围读取或更新会计与财务记录。' },
  ramp: { zh: 'Ramp 是企业支出管理平台，涵盖公司卡片、报销、账单和差旅；插件可在 Codex 中处理获授权的财务任务。' },
  lifttrack: { zh: 'LiftTrack 是面向 Garmin 用户的力量训练工具，可规划训练、同步手表并追踪动作与进度。' },
  myfitnesspal: { zh: 'MyFitnessPal 是饮食与运动记录平台；当前插件主要用于生成饮食计划、食谱和个性化营养建议。' },
  'turkish airlines': { zh: 'Turkish Airlines 是土耳其航空公司的服务插件，可查询航班状态与票价，并协助完成行程规划和订单查询。' },
  'anywheremap - navigate+locate': { zh: 'AnyWhereMap 是对话内的互动地图工具，可查看地点、缩放地图、放置标记并讨论周边区域。' },
  'destiny ai astrology': { zh: 'Destiny AI Astrology 根据出生信息生成星盘、运势与个性化占星解读，适合娱乐和自我探索。' },
  'battleships classic naval game': { zh: 'Battleships Classic Naval Game 把经典海战棋放进对话中，玩家通过猜测坐标寻找并击沉对手舰队。' },
  drawdash: { zh: 'drawDash 是限时画图猜谜游戏，用户画出指定物品，再让 ChatGPT 猜测。' },
  'astro scope tarot': { zh: 'Astro Scope Tarot 提供每日牌与过去、现在、未来三张牌占卜，可通过互动界面查看牌义和完整解读。' },
  autoscout24: { zh: 'AutoScout24 是欧洲汽车交易平台，可浏览新车、二手车与租赁信息，并按车型和条件筛选。' },
};

function genericProductIntro(name, shortDescription, longDescriptionZh, language) {
  const short = String(shortDescription || '').replace(/[.!?。！？]+$/, '').trim();
  if (language === 'en') {
    const action = short ? short.charAt(0).toLowerCase() + short.slice(1) : 'working with this service';
    return `${name} is a service that helps you ${action}. In Codex, it is most useful when a task needs the service’s information or actions to be combined with reasoning, files, or other tools.`;
  }
  const action = String(descriptionTranslations[name] || short || '完成相关工作').replace(/[。！？]+$/, '');
  const detailLead = String(longDescriptionZh || '').split(/[。！？\n]/).map((part) => part.trim()).find(Boolean);
  const detail = detailLead && detailLead.length <= 80 && /[\u4e00-\u9fa5]/.test(detailLead) && !detailLead.includes(action)
    ? ` ${detailLead}。`
    : '';
  return `${name} 的主要用途是${action}。${detail}在 Codex 中，可结合当前任务使用它提供的资料或能力。`;
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

const homepageSections = source.sections.map((section) => {
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
          websiteUrl: detail?.website_url ?? websiteOverrides[plugin.display_name] ?? null,
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
    periodStart: null,
    periodEnd: null,
  };
});

const missing = [...unique.values()].filter((plugin) => !descriptionTranslations[plugin.display_name]);
if (missing.length) throw new Error(`Missing Chinese descriptions: ${missing.map((plugin) => plugin.display_name).join(', ')}`);

const currentById = new Map(homepageSections.flatMap((section) => section.plugins.map((plugin) => [plugin.id, plugin])));
const previousHomepageSections = (previousCatalog?.sections ?? []).filter((section) => section.id !== 'latest');
const previousIds = new Set(previousHomepageSections.flatMap((section) => section.plugins.map((plugin) => plugin.id)));
const addedIds = [...currentById.keys()].filter((id) => !previousIds.has(id));
const removedIds = [...previousIds].filter((id) => !currentById.has(id));
const previousLatest = previousCatalog?.sections?.find((section) => section.id === 'latest');
const latestIds = addedIds.length
  ? addedIds
  : (previousLatest?.plugins ?? []).map((plugin) => plugin.id).filter((id) => currentById.has(id));
const fetchedAt = new Date().toISOString();
const captureDate = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Shanghai' });
const periodStart = addedIds.length ? previousCatalog?.fetchedAt?.slice(0, 10) : previousLatest?.periodStart;
const periodEnd = addedIds.length ? captureDate : previousLatest?.periodEnd;
const comparison = addedIds.length || removedIds.length
  ? {
    periodStart: previousCatalog?.fetchedAt?.slice(0, 10) ?? null,
    periodEnd: captureDate,
    addedIds,
    removedPlugins: previousHomepageSections.flatMap((section) => section.plugins)
      .filter((plugin, index, plugins) => removedIds.includes(plugin.id) && plugins.findIndex((item) => item.id === plugin.id) === index)
      .map((plugin) => ({ id: plugin.id, name: plugin.name })),
  }
  : previousCatalog?.comparison ?? null;
const latestSection = latestIds.length ? {
  id: 'latest',
  slug: 'latest',
  title: '最新',
  titleEn: 'Latest',
  description: '相较上次盘点，新出现在 Codex 插件首页的插件。',
  descriptionEn: 'Plugins newly appearing on the Codex plugin homepage since the previous snapshot.',
  plugins: latestIds.map((id) => currentById.get(id)),
  periodStart,
  periodEnd,
} : null;
const sections = latestSection ? [latestSection, ...homepageSections] : homepageSections;
const sectionEntries = source.sections.reduce((sum, section) => sum + section.plugins.length, 0);

const generated = `// Generated by scripts/sync-catalog.mjs. Do not edit by hand.\n` +
  `export const catalogSource = ${JSON.stringify({
    endpoint,
    fetchedAt,
    sectionEntries,
    uniquePlugins: unique.size,
    comparison,
    sections,
  }, null, 2)} as const;\n`;
await writeFile(generatedCatalogPath, generated);

const escapeCell = (value) => String(value ?? '').replace(/\|/g, '\\|').replace(/\s*\n+\s*/g, ' ').trim();
const doc = [
  '# Codex 插件市场首页目录',
  '',
  `盘点日期：${captureDate}。数据源：[Codex 插件首页](${endpoint})。`,
  '',
  `口径：${source.sections.length} 个原生分类、${sectionEntries} 个首页分类条目，跨分类去重后 ${unique.size} 个独立插件。下表按首页分类与顺序排列，同一插件只列一次；插件内部的 Skill 不单独计数。这不是整个市场的全量清单，分类页“查看更多”可能展示额外插件；首页陈列变化也不等于插件上架或下架。`,
  '',
  `与上次盘点（${comparison?.periodStart ?? '无历史快照'}）相比，截至 ${comparison?.periodEnd ?? captureDate} 有 ${comparison?.addedIds.length ?? 0} 个插件 ID 新出现在首页，${comparison?.removedPlugins.length ?? 0} 个旧 ID 不再出现在首页。新增条目在下表以「新」标记。`,
  '',
  '官网链接优先采用插件详情中的官网字段；首页未提供官网的少数条目使用已核对的开发者或 OpenAI 官方页面。简介为中文概括，并非官方说明全文。',
  '',
];
const documented = new Set();
for (const section of homepageSections) {
  const plugins = section.plugins.filter((plugin) => !documented.has(plugin.id));
  if (!plugins.length) continue;
  doc.push(`## ${section.title}`, '', '| 插件名 | 官网链接 | 简介 |', '| --- | --- | --- |');
  for (const plugin of plugins) {
    documented.add(plugin.id);
    const name = `${plugin.name}${latestIds.includes(plugin.id) ? '（新）' : ''}`;
    const website = plugin.websiteUrl ? `[访问官网](${plugin.websiteUrl})` : '未提供';
    doc.push(`| ${escapeCell(name)} | ${website} | ${escapeCell(plugin.productIntro)} |`);
  }
  doc.push('');
}
if (comparison?.removedPlugins.length) {
  doc.push('## 上次有、这次首页未展示', '', '以下名称来自上次首页快照，仅代表首页陈列变化，不能据此断言插件已下架。', '');
  doc.push(comparison.removedPlugins.map((plugin) => `- ${plugin.name}`).join('\n'), '');
}
await mkdir(new URL('../docs/', import.meta.url), { recursive: true });
await writeFile(new URL('../docs/当前插件目录.md', import.meta.url), `${doc.join('\n').trimEnd()}\n`);
console.log(`Synced ${source.sections.length} homepage sections, ${unique.size} unique plugins; ${addedIds.length} newly surfaced, ${removedIds.length} no longer on homepage.`);
