'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { catalog, installationPrompt, uniquePlugins, type Language } from './plugins';

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

  const copy = language === 'zh' ? {
    switchLabel: '切换为英文',
    themeLight: '浅色',
    themeDark: '深色',
    switchTheme: theme === 'dark' ? '切换为浅色主题' : '切换为深色主题',
    brand: 'Codex 插件指南',
    snapshot: '15 类 · 130 个插件 · 2026-08-28',
    eyebrow: 'CODEX PLUGIN DIRECTORY · 中文版',
    heroTitle: '插件是做什么的，',
    heroTitleSecond: '不必再猜。',
    heroBody: '按照 Codex 原生插件页面的分类与顺序，完整整理当前首页展示的全部插件。保留官方名称与图标，补上中文用途说明，并可直接生成安装 Prompt。',
    principleLabel: '目录口径',
    principleTitle: '130 个，不是几千个',
    principleBody: '当前 Codex 插件首页共有 15 个分类、133 个分类条目；去除跨分类重复后为 130 个独立插件。',
    flowHome: '插件首页',
    flowCategory: '15 个分类',
    flowAll: '全部展开',
    categoryAria: '插件分类',
    allCategories: '全部分类',
    searchPlaceholder: '搜索插件或用途',
    result: (visibleCount: number, showTotal: boolean) => `当前显示 ${visibleCount} 个分类条目${showTotal ? '，共 130 个独立插件' : ''}`,
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
    footerSource: '数据源：Codex 插件首页公开目录。最后同步：2026-08-28。分类条目可能重复出现，同一个插件始终只计一次。',
    footerCaveat: '插件可用性、账号资格与权限会变化；安装结果以 Codex 当时返回为准。',
  } : {
    switchLabel: 'Switch to Chinese',
    themeLight: 'Light',
    themeDark: 'Dark',
    switchTheme: theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme',
    brand: 'Codex Plugin Guide',
    snapshot: '15 categories · 130 plugins · 2026-08-28',
    eyebrow: 'CODEX PLUGIN DIRECTORY · ENGLISH',
    heroTitle: 'Know what each plugin does,',
    heroTitleSecond: 'before you install it.',
    heroBody: 'A complete directory of every plugin currently shown on the native Codex plugin page, in the same categories and order. Official names and icons stay intact; descriptions and example prompts can be viewed in Chinese or English.',
    principleLabel: 'DIRECTORY SCOPE',
    principleTitle: '130 plugins, not thousands',
    principleBody: 'The current Codex plugin home page has 15 categories and 133 category entries. After removing cross-category duplicates, there are 130 unique plugins.',
    flowHome: 'Plugin home',
    flowCategory: '15 categories',
    flowAll: 'Expand all',
    categoryAria: 'Plugin categories',
    allCategories: 'All categories',
    searchPlaceholder: 'Search plugins or use cases',
    result: (visibleCount: number, showTotal: boolean) => `Showing ${visibleCount} category entries${showTotal ? ' · 130 unique plugins in total' : ''}`,
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
    footerSource: 'Source: the public Codex plugin home directory. Last synced: 2026-08-28. Category entries may repeat; each plugin is counted once.',
    footerCaveat: 'Availability, account eligibility, and permissions can change. The result returned by Codex at install time is authoritative.',
  };

  const normalizedQuery = query.trim().toLowerCase();
  const visibleSections = useMemo(() => catalog.sections
    .filter((section) => activeCategory === 'all' || section.id === activeCategory)
    .map((section) => ({
      ...section,
      plugins: section.plugins.filter((plugin) => !normalizedQuery ||
        `${plugin.name} ${plugin.description} ${plugin.originalDescription} ${plugin.longDescriptionZh} ${plugin.longDescription} ${plugin.defaultPromptsZh.join(' ')} ${plugin.defaultPrompts.join(' ')}`.toLowerCase().includes(normalizedQuery)),
    }))
    .filter((section) => section.plugins.length > 0), [activeCategory, normalizedQuery]);

  const selected = uniquePlugins.filter((plugin) => selectedIds.includes(plugin.id));
  const visibleCount = visibleSections.reduce((sum, section) => sum + section.plugins.length, 0);
  const togglePlugin = (id: string) => setSelectedIds((current) =>
    current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const toggleDetails = (id: string) => setOpenDetails((current) => current === id ? null : id);

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
        <button className={activeCategory === 'all' ? 'active' : ''} onClick={() => setActiveCategory('all')}>{copy.allCategories}</button>
        {catalog.sections.map((section) => (
          <button key={section.id} className={activeCategory === section.id ? 'active' : ''} onClick={() => setActiveCategory(section.id)}>
            {language === 'zh' ? section.title : section.titleEn}<span>{section.plugins.length}</span>
          </button>
        ))}
        <label className="search-field nav-search"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={copy.searchPlaceholder} /></label>
      </nav>

      <section className="catalog-layout" id="catalog">
        <div className="catalog-main">
          <div className="result-line">
            <span>{copy.result(visibleCount, activeCategory === 'all' && !query)}</span>
            {(query || activeCategory !== 'all') && <button onClick={() => { setQuery(''); setActiveCategory('all'); }}>{copy.clearFilter}</button>}
          </div>

          <div className="category-sections">
            {visibleSections.map((section) => (
              <section className="plugin-section" key={section.id} id={`category-${section.slug}`}>
                <div className="plugin-section-heading">
                  <div><h3>{language === 'zh' ? section.title : section.titleEn}</h3>{language === 'zh' && <span>{section.titleEn}</span>}</div>
                  <p>{language === 'zh' ? section.description : section.descriptionEn}</p>
                  <b>{section.plugins.length}</b>
                </div>
                <div className="plugin-grid">
                  {section.plugins.map((plugin) => {
                    const isSelected = selectedIds.includes(plugin.id);
                    const detailKey = `${section.id}-${plugin.id}`;
                    const detailsOpen = openDetails === detailKey;
                    const introText = language === 'zh' ? plugin.productIntro : plugin.productIntroEn;
                    const introIsLong = introText.length > (language === 'zh' ? 118 : 190);
                    const compositionOpen = openCompositionDetail === detailKey;
                    const hasCompositionFacts = plugin.requiredAppCount > 0 || plugin.optionalAppCount > 0 || plugin.skillCount > 0 || plugin.templateCount > 0;
                    return (
                      <article className={`plugin-card ${isSelected ? 'selected' : ''}`} key={`${section.id}-${plugin.id}`}>
                        <div className="plugin-card-head">
                          <Image className="plugin-icon" src={plugin.icon} alt="" width={56} height={56} />
                          <span className="plugin-copy"><strong>{plugin.name}</strong><span>{language === 'zh' ? plugin.description : plugin.originalDescription}</span></span>
                          <button className="details-toggle" onClick={() => toggleDetails(detailKey)} aria-expanded={detailsOpen} aria-controls={`detail-${detailKey}`}>
                            {detailsOpen ? copy.closeDetails : copy.details}
                          </button>
                          <button className="plugin-select" onClick={() => togglePlugin(plugin.id)} aria-pressed={isSelected} aria-label={`${isSelected ? copy.removeFromList : copy.addToList}: ${plugin.name}`}>
                            <span className={`check ${isSelected ? 'checked' : ''}`} aria-hidden="true">{isSelected ? '✓' : '＋'}</span>
                          </button>
                        </div>
                        <div className={`detail-intro card-product-intro ${introIsLong ? 'is-long' : ''}`} tabIndex={introIsLong ? 0 : undefined} aria-label={introIsLong ? introText : undefined}>
                          <span>{copy.productIntro}</span>
                          <p>{introText}</p>
                        </div>
                        {detailsOpen && <div className="details-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpenDetails(null); }}>
                          <section className="plugin-details floating-details" id={`detail-${detailKey}`} role="dialog" aria-modal="true" aria-labelledby={`detail-title-${detailKey}`} onMouseDown={(event) => event.stopPropagation()}>
                            <header className="floating-details-head">
                              <Image className="plugin-icon" src={plugin.icon} alt="" width={56} height={56} />
                              <div><strong id={`detail-title-${detailKey}`}>{plugin.name}</strong><span>{language === 'zh' ? plugin.description : plugin.originalDescription}</span></div>
                              <button onClick={() => setOpenDetails(null)} aria-label={copy.closeDetails}>×</button>
                            </header>
                            <div className="floating-details-body">
                              <div className="fit-grid">
                                <div><span>{copy.usageType}</span><strong>{language === 'zh' ? plugin.usageType : plugin.usageTypeEn}</strong></div>
                                <div><span>{copy.codexFit}</span><strong>{language === 'zh' ? plugin.codexFit : plugin.codexFitEn}</strong></div>
                                <div className="composition-cell">
                                  <span>{copy.composition}</span>
                                  <strong>{language === 'zh' ? plugin.pluginType : plugin.pluginTypeEn}</strong>
                                  <div className="composition-popover">
                                    <button className="composition-detail-trigger" onClick={() => setOpenCompositionDetail(compositionOpen ? null : detailKey)} aria-expanded={compositionOpen} aria-controls={`composition-${detailKey}`}>{compositionOpen ? copy.hideComponentDetails : copy.componentDetails}</button>
                                    {compositionOpen && <div className="composition-popover-panel" id={`composition-${detailKey}`} role="dialog" aria-label={`${plugin.name} ${copy.componentDetails}`}>
                                      {plugin.requiredAppCount > 0 && <dl><dt>{copy.requiredApp}</dt><dd>{plugin.requiredApps.length > 0 ? plugin.requiredApps.join(' · ') : copy.unnamed(plugin.requiredAppCount)}</dd></dl>}
                                      {plugin.optionalAppCount > 0 && <dl><dt>{copy.optionalApp}</dt><dd>{plugin.optionalApps.length > 0 ? plugin.optionalApps.join(' · ') : copy.unnamed(plugin.optionalAppCount)}</dd></dl>}
                                      {plugin.skillCount > 0 && <dl><dt>{copy.skillLabel}</dt><dd>{plugin.skillNames.length > 0 ? plugin.skillNames.join(' · ') : copy.unnamed(plugin.skillCount)}</dd></dl>}
                                      {plugin.templateCount > 0 && <dl><dt>{copy.templateLabel}</dt><dd>{plugin.templateNames.length > 0 ? plugin.templateNames.join(' · ') : copy.unnamed(plugin.templateCount)}</dd></dl>}
                                      {!hasCompositionFacts && <p>{copy.noComponents}</p>}
                                    </div>}
                                  </div>
                                </div>
                              </div>
                              <div className="detail-judgment">
                                <p><span>{copy.suitable}</span><span className="judgment-body">{language === 'zh' ? plugin.bestFor : plugin.bestForEn}</span></p>
                                <p><span>{copy.notRecommended}</span><span className="judgment-body">{language === 'zh' ? plugin.notFor : plugin.notForEn}</span></p>
                                <p><span>{copy.proof}</span><span className="judgment-body"><q>{language === 'zh' ? plugin.proofPrompt : plugin.proofPromptEn}</q></span></p>
                              </div>
                              <div className="usage-path">
                                <span>{copy.usagePath}</span>
                                <ol>{(language === 'zh' ? plugin.usagePath : plugin.usagePathEn).map((step) => <li key={step}>{step}</li>)}</ol>
                              </div>
                              <p className="detail-original"><span>{copy.officialDescription}</span><span className="detail-body">{language === 'zh' ? plugin.longDescriptionZh : plugin.longDescription}</span></p>
                              {plugin.defaultPrompts.length > 0 && <div className="official-prompts"><span>{copy.officialPrompts}</span><ul>{(language === 'zh' ? plugin.defaultPromptsZh : plugin.defaultPrompts).map((prompt) => <li key={prompt}>{prompt}</li>)}</ul></div>}
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

          {visibleSections.length === 0 && <div className="no-results"><strong>{copy.noResultsTitle}</strong><p>{copy.noResultsBody}</p></div>}
        </div>

        <aside className="selection-panel">
          <div className="selection-title"><span>{copy.installList}</span><strong>{selected.length}</strong></div>
          {selected.length === 0 ? <div className="empty-selection"><span>＋</span><p>{copy.emptySelection}</p></div> : (
            <div className="selected-list">{selected.map((plugin) => (
              <button key={plugin.id} onClick={() => togglePlugin(plugin.id)}><Image src={plugin.icon} alt="" width={23} height={23} /><span>{plugin.name}</span><i>×</i></button>
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
