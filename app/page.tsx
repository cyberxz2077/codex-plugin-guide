'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { installationPrompt, type CatalogPlugin, type Language, type MarketIndex, type PluginSummary } from './plugins';

type Theme = 'light' | 'dark';

export default function Home() {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [openDetails, setOpenDetails] = useState<string | null>(null);
  const [openCompositionDetail, setOpenCompositionDetail] = useState<string | null>(null);
  const [copied, setCopied] = useState<'install' | null>(null);
  const [language, setLanguage] = useState<Language>('zh');
  const [theme, setTheme] = useState<Theme>('light');
  const [market, setMarket] = useState<MarketIndex | null>(null);
  const [marketError, setMarketError] = useState(false);
  const [loadedDetails, setLoadedDetails] = useState<Record<string, CatalogPlugin>>({});
  const [loadingDetailId, setLoadingDetailId] = useState<string | null>(null);
  const [displayLimit, setDisplayLimit] = useState(60);
  const detailsByCategory = useRef<Record<string, Record<string, CatalogPlugin>>>({});
  const nativeSectionCount = market?.categories.length ?? 0;
  const snapshotDate = market ? new Date(market.fetchedAt).toLocaleDateString('sv-SE', { timeZone: 'Asia/Shanghai' }) : '—';

  useEffect(() => {
    fetch('/catalog/market-index.json').then((response) => {
      if (!response.ok) throw new Error(`Catalog HTTP ${response.status}`);
      return response.json() as Promise<MarketIndex>;
    }).then((data: MarketIndex) => setMarket(data)).catch(() => setMarketError(true));
  }, []);

  const changeCategory = (id: string) => { setActiveCategory(id); setDisplayLimit(60); setOpenDetails(null); };
  const changeQuery = (value: string) => { setQuery(value); setDisplayLimit(60); setOpenDetails(null); };

  const copy = language === 'zh' ? {
    switchLabel: '切换为英文',
    themeLight: '浅色',
    themeDark: '深色',
    switchTheme: theme === 'dark' ? '切换为浅色主题' : '切换为深色主题',
    brand: 'Codex 插件指南',
    snapshot: `${nativeSectionCount} 类 · ${market?.total ?? '…'} 个插件 · ${snapshotDate}`,
    eyebrow: 'CODEX PLUGIN DIRECTORY · 中文版',
    heroTitle: '插件是做什么的，',
    heroTitleSecond: '不必再猜。',
    heroBody: '按 Codex 插件市场的全部公开分类整理插件。保留官方名称、图标和说明，补上中文用途介绍，并可生成安装 Prompt。',
    principleLabel: '目录口径',
    principleTitle: `公开目录 ${market?.total ?? '…'} 个`,
    principleBody: `首页只是入口；这里覆盖官方 ${nativeSectionCount} 个分类展开页实际展示的全部 ${market?.total ?? '…'} 个独立插件。专题分类中的重复条目、内部 Skill 不重复计数。`,
    flowHome: '插件市场',
    flowCategory: `${nativeSectionCount} 个分类`,
    flowAll: '全量目录',
    categoryAria: '插件分类',
    allCategories: '全部分类',
    searchPlaceholder: '搜索插件或用途',
    result: (visibleCount: number, totalCount: number) => `当前显示 ${visibleCount} / ${totalCount} 个独立插件`,
    loadMore: '加载更多插件',
    unavailable: '当前账号不可用',
    eligibilityUnknown: 'Codex 安装资格待确认',
    loading: '正在加载完整目录…',
    loadError: '目录加载失败，请刷新页面重试。',
    clearFilter: '清除筛选',
    details: '查看完整说明',
    closeDetails: '收起完整说明',
    addToList: '加入安装清单',
    removeFromList: '从安装清单移除',
    usageType: '使用类型',
    codexFit: 'Codex 适配',
    composition: '插件构成',
    productIntro: '产品介绍',
    suitable: '适合',
    notRecommended: '不建议',
    proof: '最小验证任务',
    usagePath: '建议使用路径',
    componentDetails: '详情',
    hideComponentDetails: '关闭',
    noComponents: '无额外 App、Skill 或模板',
    requiredApp: '必需 App',
    optionalApp: '可选 App',
    skillLabel: 'Skill',
    templateLabel: 'App 模板',
    unnamed: (count: number) => `${count} 个（名称未公开）`,
    officialDescription: '官方完整说明',
    officialPrompts: '官方示例任务',
    visitWebsite: '访问官网 ↗',
    noWebsite: '暂无官网链接',
    developer: '开发者',
    noResultsTitle: '没有找到匹配插件',
    noResultsBody: '试试搜索服务名称，或改用更短的用途关键词。',
    installList: '安装清单',
    emptySelection: '点击任意插件加入清单。',
    copiedInstall: '已复制，回 Codex 粘贴',
    copyInstall: '复制安装 Prompt',
    panelNote: 'Prompt 会先检查当前状态与权限，获得你确认后才安装。',
    footerSource: `数据源：官方插件市场全部分类展开页，按插件 ID 去重；官方目录与详情页提供元数据。最后盘点：${snapshotDate}。Skill 不单独计数。`,
    footerCaveat: '首次全市场盘点作为基线；「最新」目前标记上次与本次首页盘点间新出现的插件，不等同于新上架。插件可用性、账号资格与权限会变化；安装结果以 Codex 当时返回为准。',
  } : {
    switchLabel: 'Switch to Chinese',
    themeLight: 'Light',
    themeDark: 'Dark',
    switchTheme: theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme',
    brand: 'Codex Plugin Guide',
    snapshot: `${nativeSectionCount} categories · ${market?.total ?? '…'} plugins · ${snapshotDate}`,
    eyebrow: 'CODEX PLUGIN DIRECTORY · ENGLISH',
    heroTitle: 'Know what each plugin does,',
    heroTitleSecond: 'before you install it.',
    heroBody: 'Explore every publicly listed plugin across the Codex marketplace categories. Official names, icons, and descriptions stay intact, with Chinese explanations and an installation prompt.',
    principleLabel: 'DIRECTORY SCOPE',
    principleTitle: `${market?.total ?? '…'} publicly listed`,
    principleBody: `The homepage is only an entry point. This directory covers all ${market?.total ?? '…'} distinct plugins shown across ${nativeSectionCount} official category pages. Overlapping curated entries and bundled Skills are not counted twice.`,
    flowHome: 'Marketplace',
    flowCategory: `${nativeSectionCount} categories`,
    flowAll: 'Full directory',
    categoryAria: 'Plugin categories',
    allCategories: 'All categories',
    searchPlaceholder: 'Search plugins or use cases',
    result: (visibleCount: number, totalCount: number) => `Showing ${visibleCount} / ${totalCount} unique plugins`,
    loadMore: 'Load more plugins',
    unavailable: 'Unavailable for this account',
    eligibilityUnknown: 'Confirm Codex eligibility',
    loading: 'Loading the full catalog…',
    loadError: 'The catalog could not load. Please refresh the page.',
    clearFilter: 'Clear filters',
    details: 'View full details',
    closeDetails: 'Hide full details',
    addToList: 'Add to install list',
    removeFromList: 'Remove from install list',
    usageType: 'Usage type',
    codexFit: 'Codex fit',
    composition: 'Composition',
    productIntro: 'Product overview',
    suitable: 'Best for',
    notRecommended: 'Not for',
    proof: 'Minimum verification task',
    usagePath: 'Suggested path',
    componentDetails: 'Details',
    hideComponentDetails: 'Close',
    noComponents: 'No extra Apps, Skills, or templates',
    requiredApp: 'Required App',
    optionalApp: 'Optional App',
    skillLabel: 'Skill',
    templateLabel: 'App template',
    unnamed: (count: number) => `${count} unnamed`,
    officialDescription: 'Official description',
    officialPrompts: 'Official example prompts',
    visitWebsite: 'Visit website ↗',
    noWebsite: 'No public website',
    developer: 'Developer',
    noResultsTitle: 'No matching plugins',
    noResultsBody: 'Try a service name or a shorter use-case keyword.',
    installList: 'Install list',
    emptySelection: 'Click any plugin to add it to the list.',
    copiedInstall: 'Copied — paste it back into Codex',
    copyInstall: 'Copy install prompt',
    panelNote: 'The prompt checks the current state and permissions first, then waits for your confirmation before installing.',
    footerSource: `Source: all official marketplace category pages, deduplicated by plugin ID; metadata from the official catalog and detail pages. Last scanned: ${snapshotDate}. Skills are not counted separately.`,
    footerCaveat: 'The first full-market scan is a baseline. “Latest” currently reflects plugins newly shown on the home page, not new releases. Availability and permissions vary; Codex is authoritative at installation.',
  };

  const normalizedQuery = query.trim().toLowerCase();
  const selected = market?.plugins.filter((plugin) => selectedIds.includes(plugin.id)) ?? [];
  const { visibleSections, matchingCount } = useMemo(() => {
    if (!market) return { visibleSections: [], matchingCount: 0 };
    const category = market.categories.find((item) => item.id === activeCategory);
    const ids = activeCategory === 'latest' ? new Set(market.latest.ids) : new Set(category?.ids ?? []);
    const matches = market.plugins.filter((plugin) =>
      (activeCategory === 'all' || ids.has(plugin.id)) &&
      (!normalizedQuery || `${plugin.name} ${plugin.description} ${plugin.originalDescription} ${plugin.productIntro} ${plugin.productIntroEn}`.toLowerCase().includes(normalizedQuery)));
    const section = activeCategory === 'latest' ? {
      id: 'latest', slug: 'latest', title: '最新', titleEn: 'Latest', description: market.latest.basis === 'homepage' ? '两次首页盘点之间新出现的插件；不代表新上架。' : '相较上次全市场盘点新增的插件。', descriptionEn: market.latest.basis === 'homepage' ? 'Newly shown between homepage snapshots; not necessarily newly released.' : 'New since the last full-market scan.',
    } : category ? {
      id: category.id, slug: category.id, title: category.title, titleEn: category.titleEn, description: category.description, descriptionEn: category.titleEn,
    } : {
      id: 'all', slug: 'all', title: '全部插件', titleEn: 'All plugins', description: '按官方目录顺序展示全部公开列出的插件。', descriptionEn: 'All publicly listed plugins in official catalog order.',
    };
    return { visibleSections: matches.length ? [{ ...section, plugins: matches.slice(0, displayLimit) }] : [], matchingCount: matches.length };
  }, [market, activeCategory, normalizedQuery, displayLimit]);
  const visibleCount = visibleSections[0]?.plugins.length ?? 0;
  const togglePlugin = (id: string) => setSelectedIds((current) =>
    current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const toggleDetails = async (plugin: PluginSummary) => {
    if (openDetails === plugin.id) { setOpenDetails(null); return; }
    if (loadedDetails[plugin.id]) { setOpenDetails(plugin.id); return; }
    setLoadingDetailId(plugin.id);
    try {
      if (!detailsByCategory.current[plugin.category]) {
        const response = await fetch(`/catalog/details-${plugin.category}.json`);
        if (!response.ok) throw new Error(`Details HTTP ${response.status}`);
        detailsByCategory.current[plugin.category] = await response.json();
      }
      const detail = detailsByCategory.current[plugin.category][plugin.id];
      if (!detail) throw new Error('Plugin details not found');
      setLoadedDetails((current) => ({ ...current, [plugin.id]: detail }));
      setOpenDetails(plugin.id);
    } catch { setMarketError(true); }
    finally { setLoadingDetailId(null); }
  };

  useEffect(() => {
    const closeOnBackgroundClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      if (!target?.closest('.composition-popover')) setOpenCompositionDetail(null);
      if (target?.closest('button,a,input,select,textarea,label,details,summary,nav,aside,.plugin-card')) return;
      setOpenDetails(null);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpenCompositionDetail(null);
      setOpenDetails(null);
    };
    document.addEventListener('click', closeOnBackgroundClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('click', closeOnBackgroundClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, []);

  useEffect(() => {
    if (!openDetails) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, [openDetails]);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem('codex-plugin-guide-theme');
    const preferredTheme: Theme = savedTheme === 'light' || savedTheme === 'dark'
      ? savedTheme
      : window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    document.documentElement.dataset.theme = preferredTheme;
    const syncTheme = window.requestAnimationFrame(() => setTheme(preferredTheme));
    return () => window.cancelAnimationFrame(syncTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem('codex-plugin-guide-theme', nextTheme);
    setTheme(nextTheme);
  };

  const copyText = async (value: string, type: 'install') => {
    await navigator.clipboard.writeText(value);
    setCopied(type);
    window.setTimeout(() => setCopied(null), 1600);
  };

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#top"><span className="brand-mark">C</span><span>{copy.brand}</span></a>
        <div className="topbar-actions">
          <button className={`theme-toggle ${theme === 'dark' ? 'is-dark' : ''}`} onClick={toggleTheme} aria-pressed={theme === 'dark'} aria-label={copy.switchTheme}>
            {theme === 'dark' ? copy.themeDark : copy.themeLight}
          </button>
          <button className={`language-toggle ${language === 'en' ? 'is-en' : ''}`} onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')} aria-pressed={language === 'en'} aria-label={copy.switchLabel}>
            <span>中</span><span className="language-toggle-track"><i className="language-toggle-thumb" /></span><span>EN</span>
          </button>
          <span className="snapshot">{copy.snapshot}</span>
        </div>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <span className="eyebrow">{copy.eyebrow}</span>
          <h1>{copy.heroTitle}<br />{copy.heroTitleSecond}</h1>
          <p>{copy.heroBody}</p>
        </div>
        <div className="principle-card">
          <span className="principle-number">{copy.principleLabel}</span>
          <strong>{copy.principleTitle}</strong>
          <p>{copy.principleBody}</p>
          <div className="mini-flow"><span>{copy.flowHome}</span><i>→</i><span>{copy.flowCategory}</span><i>→</i><span>{copy.flowAll}</span></div>
        </div>
      </section>

      <nav className="category-nav" aria-label={copy.categoryAria}>
        <button className={activeCategory === 'all' ? 'active' : ''} onClick={() => changeCategory('all')}>{copy.allCategories}</button>
        {market && <button className={activeCategory === 'latest' ? 'active' : ''} onClick={() => changeCategory('latest')}>{language === 'zh' ? '最新' : 'Latest'}<span>{market.latest.ids.length}</span></button>}
        {market?.categories.map((category) => <button key={category.id} className={activeCategory === category.id ? 'active' : ''} onClick={() => changeCategory(category.id)}>{language === 'zh' ? category.title : category.titleEn}<span>{category.count}</span></button>)}
        <label className="search-field nav-search"><span>⌕</span><input value={query} onChange={(event) => changeQuery(event.target.value)} placeholder={copy.searchPlaceholder} /></label>
      </nav>

      <section className="catalog-layout" id="catalog">
        <div className="catalog-main">
          <div className="result-line">
            <span>{market ? copy.result(visibleCount, matchingCount) : marketError ? copy.loadError : copy.loading}</span>
            {(query || activeCategory !== 'all') && <button onClick={() => { changeQuery(''); changeCategory('all'); }}>{copy.clearFilter}</button>}
          </div>

          <div className="category-sections">
            {visibleSections.map((section) => (
              <section className="plugin-section" key={section.id} id={`category-${section.slug}`}>
                <div className="plugin-section-heading">
                  <div><h3>{language === 'zh' ? section.title : section.titleEn}</h3>{section.id === 'latest' && market?.latest.periodStart ? <small className="section-period">{market.latest.periodStart} — {market.latest.periodEnd}{language === 'zh' ? market.latest.basis === 'homepage' ? ' 首页新增' : ' 全市场新增' : market.latest.basis === 'homepage' ? ' · Newly shown on home' : ' · New in marketplace'}</small> : language === 'zh' && <span>{section.titleEn}</span>}</div>
                  <p>{language === 'zh' ? section.description : section.descriptionEn}</p>
                  <b>{matchingCount}</b>
                </div>
                <div className="plugin-grid">
                  {section.plugins.map((plugin) => {
                    const isSelected = selectedIds.includes(plugin.id);
                    const detailKey = plugin.id;
                    const detailsOpen = openDetails === detailKey;
                    const fullPlugin = loadedDetails[plugin.id];
                    const introText = language === 'zh' ? plugin.productIntro : plugin.productIntroEn;
                    const introIsLong = introText.length > (language === 'zh' ? 118 : 190);
                    const compositionOpen = openCompositionDetail === detailKey;
                    const hasCompositionFacts = fullPlugin && (fullPlugin.compositionNote || fullPlugin.requiredAppCount > 0 || fullPlugin.optionalAppCount > 0 || fullPlugin.skillCount > 0 || fullPlugin.templateCount > 0);
                    return (
                      <article className={`plugin-card ${isSelected ? 'selected' : ''}`} key={`${section.id}-${plugin.id}`}>
                        <div className="plugin-card-head">
                          <Image className="plugin-icon" src={plugin.icon} alt="" width={56} height={56} unoptimized />
                          <span className="plugin-copy"><strong>{plugin.name}</strong><span>{language === 'zh' ? plugin.description : plugin.originalDescription}</span>{plugin.available !== true && <small className="plugin-unavailable">{plugin.available === null ? copy.eligibilityUnknown : copy.unavailable}</small>}</span>
                          <button className="details-toggle" onClick={() => toggleDetails(plugin)} disabled={loadingDetailId === plugin.id} aria-expanded={detailsOpen} aria-controls={`detail-${detailKey}`}>
                            {loadingDetailId === plugin.id ? '…' : detailsOpen ? copy.closeDetails : copy.details}
                          </button>
                          <button className="plugin-select" onClick={() => togglePlugin(plugin.id)} aria-pressed={isSelected} aria-label={`${isSelected ? copy.removeFromList : copy.addToList}: ${plugin.name}`}>
                            <span className={`check ${isSelected ? 'checked' : ''}`} aria-hidden="true">{isSelected ? '✓' : '＋'}</span>
                          </button>
                        </div>
                        <div className={`detail-intro card-product-intro ${introIsLong ? 'is-long' : ''}`} tabIndex={introIsLong ? 0 : undefined} aria-label={introIsLong ? introText : undefined}>
                          <span>{copy.productIntro}</span>
                          <p>{introText}</p>
                        </div>
                        {detailsOpen && fullPlugin && <div className="details-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpenDetails(null); }}>
                          <section className="plugin-details floating-details" id={`detail-${detailKey}`} role="dialog" aria-modal="true" aria-labelledby={`detail-title-${detailKey}`} onMouseDown={(event) => event.stopPropagation()}>
                            <header className="floating-details-head">
                              <Image className="plugin-icon" src={plugin.icon} alt="" width={56} height={56} unoptimized />
                              <div><strong id={`detail-title-${detailKey}`}>{plugin.name}</strong><span>{language === 'zh' ? plugin.description : plugin.originalDescription}</span></div>
                              <button onClick={() => setOpenDetails(null)} aria-label={copy.closeDetails}>×</button>
                            </header>
                            <div className="floating-details-body">
                              <div className="fit-grid">
                                <div><span>{copy.usageType}</span><strong>{language === 'zh' ? fullPlugin.usageType : fullPlugin.usageTypeEn}</strong></div>
                                <div><span>{copy.codexFit}</span><strong>{language === 'zh' ? fullPlugin.codexFit : fullPlugin.codexFitEn}</strong></div>
                                <div className="composition-cell">
                                  <span>{copy.composition}</span>
                                  <strong>{language === 'zh' ? fullPlugin.pluginType : fullPlugin.pluginTypeEn}</strong>
                                  <div className="composition-popover">
                                    <button className="composition-detail-trigger" onClick={() => setOpenCompositionDetail(compositionOpen ? null : detailKey)} aria-expanded={compositionOpen} aria-controls={`composition-${detailKey}`}>{compositionOpen ? copy.hideComponentDetails : copy.componentDetails}</button>
                                    {compositionOpen && <div className="composition-popover-panel" id={`composition-${detailKey}`} role="dialog" aria-label={`${plugin.name} ${copy.componentDetails}`}>
                                      {fullPlugin.compositionNote && <p>{language === 'zh' ? fullPlugin.compositionNote : fullPlugin.compositionNoteEn}</p>}
                                      {fullPlugin.requiredAppCount > 0 && <dl><dt>{copy.requiredApp}</dt><dd>{fullPlugin.requiredApps.length > 0 ? fullPlugin.requiredApps.join(' · ') : copy.unnamed(fullPlugin.requiredAppCount)}</dd></dl>}
                                      {fullPlugin.optionalAppCount > 0 && <dl><dt>{copy.optionalApp}</dt><dd>{fullPlugin.optionalApps.length > 0 ? fullPlugin.optionalApps.join(' · ') : copy.unnamed(fullPlugin.optionalAppCount)}</dd></dl>}
                                      {fullPlugin.skillCount > 0 && <dl><dt>{copy.skillLabel}</dt><dd>{fullPlugin.skillNames.length > 0 ? fullPlugin.skillNames.join(' · ') : copy.unnamed(fullPlugin.skillCount)}</dd></dl>}
                                      {fullPlugin.templateCount > 0 && <dl><dt>{copy.templateLabel}</dt><dd>{fullPlugin.templateNames.length > 0 ? fullPlugin.templateNames.join(' · ') : copy.unnamed(fullPlugin.templateCount)}</dd></dl>}
                                      {!hasCompositionFacts && <p>{copy.noComponents}</p>}
                                    </div>}
                                  </div>
                                </div>
                              </div>
                              <div className="detail-judgment">
                                <p><span>{copy.suitable}</span><span className="judgment-body">{language === 'zh' ? fullPlugin.bestFor : fullPlugin.bestForEn}</span></p>
                                <p><span>{copy.notRecommended}</span><span className="judgment-body">{language === 'zh' ? fullPlugin.notFor : fullPlugin.notForEn}</span></p>
                                <p><span>{copy.proof}</span><span className="judgment-body"><q>{language === 'zh' ? fullPlugin.proofPrompt : fullPlugin.proofPromptEn}</q></span></p>
                              </div>
                              <div className="usage-path">
                                <span>{copy.usagePath}</span>
                                <ol>{(language === 'zh' ? fullPlugin.usagePath : fullPlugin.usagePathEn).map((step) => <li key={step}>{step}</li>)}</ol>
                              </div>
                              <p className="detail-original"><span>{copy.officialDescription}</span><span className="detail-body">{language === 'zh' ? fullPlugin.longDescriptionZh : fullPlugin.longDescription}</span></p>
                              {fullPlugin.defaultPrompts.length > 0 && <div className="official-prompts"><span>{copy.officialPrompts}</span><ul>{(language === 'zh' ? fullPlugin.defaultPromptsZh : fullPlugin.defaultPrompts).map((prompt) => <li key={prompt}>{prompt}</li>)}</ul></div>}
                              <div className="floating-details-footer">
                                {plugin.websiteUrl ? <a href={plugin.websiteUrl} target="_blank" rel="noreferrer">{copy.visitWebsite}</a> : <span>{copy.noWebsite}</span>}
                                {plugin.developerName && <span>{copy.developer}: {plugin.developerName}</span>}
                              </div>
                            </div>
                          </section>
                        </div>}
                        <div className="plugin-links">
                          {plugin.websiteUrl ? <a href={plugin.websiteUrl} target="_blank" rel="noreferrer">{copy.visitWebsite}</a> : <span>{copy.noWebsite}</span>}
                          {plugin.developerName && <span>{copy.developer}: {plugin.developerName}</span>}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>

          {matchingCount > visibleCount && <button className="load-more" onClick={() => setDisplayLimit((current) => current + 60)}>{copy.loadMore} · {matchingCount - visibleCount}</button>}
          {market && visibleSections.length === 0 && <div className="no-results"><strong>{copy.noResultsTitle}</strong><p>{copy.noResultsBody}</p></div>}
        </div>

        <aside className="selection-panel">
          <div className="selection-title"><span>{copy.installList}</span><strong>{selected.length}</strong></div>
          {selected.length === 0 ? <div className="empty-selection"><span>＋</span><p>{copy.emptySelection}</p></div> : (
            <div className="selected-list">{selected.map((plugin) => (
              <button key={plugin.id} onClick={() => togglePlugin(plugin.id)}><Image src={plugin.icon} alt="" width={23} height={23} unoptimized /><span>{plugin.name}</span><i>×</i></button>
            ))}</div>
          )}
          <button className="copy-button" disabled={!selected.length} onClick={() => copyText(installationPrompt(selected, language), 'install')}>
            {copied === 'install' ? copy.copiedInstall : copy.copyInstall}
          </button>
          <p className="panel-note">{copy.panelNote}</p>
        </aside>
      </section>

      <footer>
        <p>{copy.footerSource}</p>
        <p>{copy.footerCaveat}</p>
      </footer>
    </main>
  );
}
