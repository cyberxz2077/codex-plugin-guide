export type Language = 'zh' | 'en';
export type PluginSummary = {
  id: string;
  name: string;
  category: string;
  description: string;
  originalDescription: string;
  productIntro: string;
  productIntroEn: string;
  icon: string;
  websiteUrl: string | null;
  developerName: string | null;
  available: boolean | null;
};

export type CatalogPlugin = PluginSummary & {
  longDescription: string;
  longDescriptionZh: string;
  defaultPrompts: string[];
  defaultPromptsZh: string[];
  usageType: string;
  usageTypeEn: string;
  codexFit: string;
  codexFitEn: string;
  pluginType: string;
  pluginTypeEn: string;
  requiredApps: string[];
  optionalApps: string[];
  skillNames: string[];
  templateNames: string[];
  requiredAppCount: number;
  optionalAppCount: number;
  skillCount: number;
  templateCount: number;
  compositionNote?: string;
  compositionNoteEn?: string;
  bestFor: string;
  bestForEn: string;
  notFor: string;
  notForEn: string;
  proofPrompt: string;
  proofPromptEn: string;
  usagePath: string[];
  usagePathEn: string[];
};

export type MarketIndex = {
  fetchedAt: string;
  total: number;
  available: number;
  latest: { ids: string[]; periodStart: string | null; periodEnd: string; basis: 'homepage' | 'full-market' };
  categories: { id: string; title: string; titleEn: string; description: string; count: number; ids: string[] }[];
  plugins: PluginSummary[];
};

export function installationPrompt(selected: readonly Pick<PluginSummary, 'name'>[], language: Language = 'zh') {
  const list = selected.map((plugin, index) => `${index + 1}. ${plugin.name}`).join('\n');
  if (language === 'en') {
    return `Use Codex plugin management to check and install the following plugins:\n${list}\n\nRequirements:\n- Search for each plugin by its official name and check whether it is already installed or available. Do not reinstall it.\n- For plugins that are not installed, explain which service they connect to, what data they can read or write, and which permissions they need.\n- Wait for my explicit confirmation before installing or authorizing anything. Do not install plugins outside this list.\n- If more than one result has the same name, show me the candidates instead of guessing.\n- Report the actual status of every plugin at the end.`;
  }
  return `请使用 Codex 的插件管理能力，检查并安装以下插件：\n${list}\n\n要求：\n- 按插件官方名称逐个搜索，先确认它是否已经安装或可用，不要重复安装。\n- 对尚未安装的插件，先用中文说明它会连接什么服务、读取或写入什么数据、需要哪些权限。\n- 等我明确确认后再执行安装或授权；不要顺带安装清单外的插件。\n- 如果同名结果不唯一，先列出候选让我选择，不要自行猜测。\n- 最后报告每个插件的实际状态。`;
}

export function consultantPrompt(language: Language = 'zh') {
  if (language === 'en') {
    return 'You are my Codex plugin advisor. Start by asking up to 3 short questions about what I need to accomplish, where the relevant material is, and what permissions I can accept. Then use Codex plugin management to search the current catalog. Recommend only the smallest plugin combination needed, and explain what each plugin does, why it is needed, which account it connects to, and what data it may read or write. Do not install anything until I explicitly confirm.';
  }
  return '你是我的 Codex 插件顾问。先用最多 3 个简短问题了解我要完成的任务、资料所在位置和可接受的权限范围，然后使用 Codex 的插件管理能力搜索当前插件目录。只推荐完成任务所需的最小插件组合，并用中文说明每个插件能做什么、为什么需要它、要连接什么账号、会读取或写入哪些数据。不要直接安装；等我明确确认后再执行。';
}
