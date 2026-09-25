import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { categoryTranslations } from './catalog-translations.mjs';
import { readOfficialCatalog } from './catalog-source.mjs';

const source = await readOfficialCatalog();
const homepageText = await readFile(new URL('../app/catalog.generated.ts', import.meta.url), 'utf8');
const homepage = JSON.parse(homepageText.replace(/^.*?= /s, '').replace(/ as const;\s*$/, ''));
const homepageDetails = new Map(homepage.sections.flatMap((section) => section.plugins.map((plugin) => [plugin.id, plugin])));
const listed = source.plugins.filter((plugin) => plugin.scope === 'GLOBAL' && plugin.discoverability === 'LISTED');
const byId = new Map(listed.map((plugin) => [plugin.id, plugin]));
if (byId.size !== listed.length) throw new Error('Duplicate plugin IDs in official catalog');

let translations = {};
try { translations = JSON.parse(await readFile(new URL('./market-translation-cache.json', import.meta.url), 'utf8')); } catch { /* English remains available if translation has not run yet. */ }
let previous = null;
try { previous = JSON.parse(await readFile(new URL('../public/catalog/market-index.json', import.meta.url), 'utf8')); } catch { /* First full-market baseline. */ }

const manualShortTranslations = {
  'Sistem toplama ve PC parçaları': '配置电脑整机与零部件。',
  'Generate, educate school+class': '生成课堂教学计划与学习材料。',
  'Crypto market analysis tool': '分析加密资产市场。',
  'Find travel things-to-do': '查找旅行目的地的活动与体验。',
  'Jobs, remote, resume & salary': '查找工作、远程岗位、简历与薪资信息。',
  'Connect Camera Roll & Photos': '连接相册与照片。',
  'Draw and visualize ideas': '绘制草图并可视化想法。',
  'Create and edit AI videos': '创建与编辑 AI 视频。',
  'Turn PDFs & Notes to Quizzes': '把 PDF 和笔记转换为测验。',
  'Hire, apply, and manage work': '在 Upwork 招聘、申请项目并管理工作。',
  '나를 나답게 만드는 취향 발견, LFmall AI 쇼핑': '通过 LFmall 的 AI 购物发现符合个人喜好的商品。',
  'Tra cứu Nghị quyết 57': '查询越南第 57 号决议相关内容。',
  'Wyszukiwarka przetargów': '搜索公开招标信息。',
  'Аграрный маркетплейс': '浏览农业交易市场。',
  '내 녹음의 전사·요약·마인드맵 찾기': '查找录音转写、摘要与思维导图。',
  '배달할 때마다 포인트 적립': '使用外卖服务并累积积分。',
  '공식 브랜드 쇼핑부터 스마트 뷰티 케어까지': '浏览品牌商品和智能美容护理服务。',
  '사주팔자, AI로 해석해드릴게요': '使用 AI 解读生辰八字。',
  '목적지까지 최적의 경로 찾기': '查找前往目的地的最佳路线。',
  'Belege und Buchhaltung': '整理凭证与会计账目。',
};

const categoryOrder = [
  'Productivity', 'Creativity', 'Developer Tools', 'Business & Operations',
  'Data & Analytics', 'Communication', 'Education & Research', 'Scientific Research',
  'Security', 'Finance', 'Healthcare', 'Travel', 'Entertainment', 'Other',
];
const slug = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const zh = (value) => manualShortTranslations[value] ?? translations[value] ?? value;
const hasChinese = (value) => /[\u4e00-\u9fff]/.test(value ?? '');
const safeUrl = (value) => /^https?:\/\//i.test(value ?? '') ? value : null;
const trimIntro = (value, limit) => {
  const first = String(value ?? '').split(/\n\s*\n/)[0].replace(/\s+/g, ' ').trim();
  if (first.length <= limit) return first;
  const at = Math.max(first.lastIndexOf('。', limit), first.lastIndexOf('.', limit));
  return at > limit * .5 ? first.slice(0, at + 1) : `${first.slice(0, limit).trim()}…`;
};
const fallbackIcon = '/icons/plugin-management.svg';
const summaries = [];
const detailsByCategory = new Map(categoryOrder.map((name) => [slug(name), {}]));
for (const plugin of listed) {
  const release = plugin.release ?? {};
  const official = release.interface ?? {};
  const known = homepageDetails.get(plugin.id);
  const name = release.display_name;
  const category = official.category;
  const categoryId = slug(category);
  const shortEn = official.short_description;
  const longEn = official.long_description;
  const shortZh = zh(shortEn);
  const longTranslation = zh(longEn);
  const translatedLong = Boolean(translations[longEn]) || !/[A-Za-z]/.test(longEn);
  const longZh = translatedLong ? longTranslation : `（翻译待补，以下为官方英文原文。）\n\n${longEn}`;
  const apps = Object.entries(release.app_manifest?.apps ?? {});
  const skills = release.skills ?? [];
  const templates = release.app_templates ?? [];
  const hasApps = apps.length > 0;
  const hasSkills = skills.length > 0;
  const required = apps.filter(([, info]) => info.required).map(([label]) => label);
  const optional = apps.filter(([, info]) => !info.required).map(([label]) => label);
  const summary = {
    id: plugin.id,
    name,
    category: categoryId,
    description: known?.description ?? shortZh,
    originalDescription: shortEn,
    productIntro: known?.productIntro ?? (translatedLong && hasChinese(trimIntro(longTranslation, 230)) ? trimIntro(longTranslation, 230) : `${name}：${shortZh.replace(/[。！？.!?]+$/, '')}。`),
    productIntroEn: known?.productIntroEn ?? trimIntro(longEn, 390),
    icon: known?.icon ?? safeUrl(official.logo_url) ?? fallbackIcon,
    websiteUrl: safeUrl(official.website_url) ?? known?.websiteUrl ?? null,
    developerName: official.developer_name ?? known?.developerName ?? null,
    available: plugin.status === 'AVAILABLE',
  };
  const prompts = official.default_prompts ?? [];
  const detail = known ? {
    ...known,
    ...summary,
    longDescription: longEn,
    longDescriptionZh: longZh,
    defaultPrompts: prompts,
    defaultPromptsZh: prompts.map((prompt) => hasChinese(zh(prompt)) ? zh(prompt) : `（翻译待补）${prompt}`),
  } : {
    ...summary,
    longDescription: longEn,
    longDescriptionZh: longZh,
    defaultPrompts: prompts,
    defaultPromptsZh: prompts.map((prompt) => hasChinese(zh(prompt)) ? zh(prompt) : `（翻译待补）${prompt}`),
    usageType: hasApps && hasSkills ? '跨工具工作流' : hasApps ? '服务连接' : hasSkills ? 'Codex 工作流' : '插件能力',
    usageTypeEn: hasApps && hasSkills ? 'Cross-tool workflow' : hasApps ? 'Service connection' : hasSkills ? 'Codex workflow' : 'Plugin capability',
    codexFit: '未逐项验证',
    codexFitEn: 'Not individually verified',
    pluginType: hasApps && hasSkills ? 'App + Skill' : hasApps ? 'App 连接器' : hasSkills ? 'Skill' : templates.length ? 'App 模板' : '组成待核验',
    pluginTypeEn: hasApps && hasSkills ? 'App + Skill' : hasApps ? 'App connector' : hasSkills ? 'Skill' : templates.length ? 'App template' : 'Composition to verify',
    requiredApps: required,
    optionalApps: optional,
    skillNames: skills.map((skill) => skill.name).filter(Boolean),
    templateNames: templates.map((template) => template.name).filter(Boolean),
    requiredAppCount: required.length,
    optionalAppCount: optional.length,
    skillCount: skills.length,
    templateCount: templates.length,
    bestFor: hasApps ? '需要在 Codex 中使用该服务的授权资料或明确操作，并与当前任务的其他材料结合。' : '官方功能与当前任务直接相关，且能定义可检查的输出时。',
    bestForEn: hasApps ? 'When a Codex task needs authorized data or specific actions from this service alongside other task context.' : 'When the official capability directly supports a task with a verifiable output.',
    notFor: '仅凭名称判断有用；未确认账号权限、插件组成和官方能力前就授权写入。',
    notForEn: 'Choosing by name alone or authorizing writes before checking account access, composition, and official capabilities.',
    proofPrompt: `只读检查 ${name} 插件能提供什么资料或能力，并列出权限与限制；不创建、不修改、不发送。`,
    proofPromptEn: `Read-only check what the ${name} plugin can access or do, including permissions and limits. Do not create, modify, or send anything.`,
    usagePath: ['核对官方说明与插件构成', '确认账号和数据授权范围', '在 Codex 中做最小只读验证', '确认结果后再执行写入'],
    usagePathEn: ['Review the official description and composition', 'Confirm account and data permissions', 'Run a minimal read-only check in Codex', 'Allow writes only after reviewing the result'],
  };
  summaries.push(summary);
  detailsByCategory.get(categoryId)[plugin.id] = detail;
}

const now = new Date();
const date = now.toLocaleDateString('sv-SE', { timeZone: 'Asia/Shanghai' });
const previousIds = new Set(previous?.plugins?.map((plugin) => plugin.id) ?? []);
const addedIds = previous ? summaries.filter((plugin) => !previousIds.has(plugin.id)).map((plugin) => plugin.id) : [];
const currentIds = new Set(summaries.map((plugin) => plugin.id));
const removedIds = previous ? [...previousIds].filter((id) => !currentIds.has(id)) : [];
const firstLatestIds = homepage.sections.find((section) => section.id === 'latest')?.plugins.map((plugin) => plugin.id).filter((id) => byId.has(id)) ?? [];
const latestIds = previous ? (addedIds.length ? addedIds : previous.latest.ids.filter((id) => byId.has(id))) : firstLatestIds;
const latest = previous && addedIds.length ? {
  ids: latestIds,
  periodStart: previous.fetchedAt.slice(0, 10),
  periodEnd: date,
  basis: 'full-market',
} : previous ? {
  ...previous.latest,
  ids: latestIds,
} : {
  ids: latestIds,
  periodStart: homepage.sections.find((section) => section.id === 'latest')?.periodStart ?? null,
  periodEnd: homepage.sections.find((section) => section.id === 'latest')?.periodEnd ?? date,
  basis: 'homepage',
};
const featuredIds = homepage.sections.find((section) => section.id === 'featured')?.plugins.map((plugin) => plugin.id).filter((id) => byId.has(id)) ?? [];
const categories = categoryOrder.map((name) => ({
  id: slug(name),
  title: categoryTranslations[name.toLowerCase()]?.[0] ?? name,
  titleEn: name,
  description: categoryTranslations[name.toLowerCase()]?.[1] ?? '',
  count: summaries.filter((plugin) => plugin.category === slug(name)).length,
}));
const index = {
  source: 'Codex CLI marketplace openai-curated-remote, scope GLOBAL, discoverability LISTED',
  fetchedAt: now.toISOString(),
  total: summaries.length,
  available: summaries.filter((plugin) => plugin.available).length,
  latest,
  featuredIds,
  categories,
  comparison: { addedIds, removedIds },
  plugins: summaries,
};
const outputDir = new URL('../public/catalog/', import.meta.url);
await mkdir(outputDir, { recursive: true });
await writeFile(new URL('market-index.json', outputDir), `${JSON.stringify(index)}\n`);
for (const [categoryId, details] of detailsByCategory) {
  await writeFile(new URL(`details-${categoryId}.json`, outputDir), `${JSON.stringify(details)}\n`);
}

const cell = (value) => String(value ?? '').replace(/\|/g, '\\|').replace(/\s*\n+\s*/g, ' ').trim();
const allDetails = [...detailsByCategory.values()].flatMap((group) => Object.values(group));
const pendingDescriptions = allDetails.filter((plugin) => plugin.longDescriptionZh.startsWith('（翻译待补')).length;
const pendingPrompts = allDetails.reduce((sum, plugin) => sum + plugin.defaultPromptsZh.filter((prompt) => prompt.startsWith('（翻译待补')).length, 0);
const doc = [
  '# Codex 插件市场全量目录', '',
  `盘点日期：${date}。来源：Codex 官方插件目录（\`openai-curated-remote\`），筛选公开列出的全局插件（\`scope=GLOBAL\`、\`discoverability=LISTED\`）。`, '',
  `共 ${summaries.length} 个独立插件，其中当前账号可用 ${index.available} 个，${summaries.length - index.available} 个因账号或管理策略显示不可用。插件内附带的 Skill 不单独计数。不同账号或地区看到的可用性可能不同。`, '',
  `本次是首次全市场基线；之前的 142 个仅为首页陈列，不能用 ${summaries.length - 142} 的差值推断新上架。${latest.basis === 'homepage' ? `「最新」暂沿用 ${latest.periodStart} 至 ${latest.periodEnd} 的首页变化记录。` : `全市场与 ${latest.periodStart} 基线相比新增 ${addedIds.length} 个、移出 ${removedIds.length} 个。`}`, '',
  '官网链接取自插件官方目录字段；未提供的条目明确标注“未提供”。中文简介以官方说明翻译和概括为基础，并非逐项独立测评。', '',
  `翻译状态：所有插件的短简介与下表简介均有中文；${pendingDescriptions} 条官方完整说明和 ${pendingPrompts} 条官方示例任务仍待补译，网站详情中保留英文原文并明确标注。`, '',
];
for (const category of categories) {
  doc.push(`## ${category.title} · ${category.titleEn}（${category.count}）`, '', '| 插件名 | 官网链接 | 简介 |', '| --- | --- | --- |');
  for (const plugin of summaries.filter((item) => item.category === category.id)) {
    const website = plugin.websiteUrl ? `[访问官网](${plugin.websiteUrl})` : '未提供';
    doc.push(`| ${cell(plugin.name)} | ${website} | ${cell(plugin.productIntro || plugin.description)} |`);
  }
  doc.push('');
}
await writeFile(new URL('../docs/当前插件目录.md', import.meta.url), `${doc.join('\n').trimEnd()}\n`);
console.log(`Synced ${summaries.length} listed plugins in ${categories.length} categories; ${addedIds.length} new since full-market baseline; ${Object.keys(translations).length} cached translations.`);
