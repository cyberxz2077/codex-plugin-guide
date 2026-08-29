# Design QA

## Comparison target

- Source visual truth:
  - `/var/folders/11/gc16jzys5tz0v62h1t5x0cmw0000gp/T/codex-clipboard-f2deeb52-34fd-4626-be09-cf0bae994db9.png` — 首页结构标注，4076 × 1552 px。
  - `/var/folders/11/gc16jzys5tz0v62h1t5x0cmw0000gp/T/codex-clipboard-e0ea3d8e-14d5-44a7-8d42-bca669afbb96.png` — 长内容弹窗标注，2254 × 2324 px。
  - `/var/folders/11/gc16jzys5tz0v62h1t5x0cmw0000gp/T/codex-clipboard-f41724e6-0a34-4ccf-a936-1b9bd13ed95d.png` — 长产品介绍浮层标注，864 × 664 px。
  - `/var/folders/11/gc16jzys5tz0v62h1t5x0cmw0000gp/T/codex-clipboard-6036d0d9-8c9d-4d94-ab75-c9b43db956e3.png` — 插件图标尺寸标注，208 × 194 px。
  - `/var/folders/11/gc16jzys5tz0v62h1t5x0cmw0000gp/T/codex-clipboard-d27197a5-aa7e-4be1-bde9-0677cf9af0f5.png` — 窄窗口分类被裁切反馈，2322 × 416 px。
  - `/var/folders/11/gc16jzys5tz0v62h1t5x0cmw0000gp/T/codex-clipboard-0ad53466-57ee-4938-9c9b-87e6fdcdb7f5.png` — 图标内部留白反馈，346 × 290 px。
- Rendered implementation: `http://localhost:3000/`。
- Implementation screenshots:
  - `/tmp/codex-plugin-guide-home.png` — 2033 × 774 px，CSS viewport 2048 × 780。
  - `/tmp/codex-plugin-guide-modal-todoist.png` — 1440 × 1000 px，CSS viewport 1440 × 1000。
  - `/tmp/codex-plugin-guide-modal-bottom.png` — 1440 × 1000 px，弹窗滚动到底部。
  - `/tmp/codex-plugin-guide-hover.png` — 1425 × 990 px，CSS viewport 1440 × 1000，Apollo.io 卡片悬停。
  - `/tmp/codex-plugin-guide-icon-crop.png` — 360 × 120 px，卡片图标聚焦区域。
  - `/tmp/codex-plugin-guide-mobile.png` — 375 × 812 px，CSS viewport 390 × 844。
  - `/tmp/codex-plugin-guide-midwidth-fixed.png` — 中等宽度分类完整换行状态。
  - `/tmp/codex-plugin-guide-narrow-home-fixed.png` — CSS viewport 390 × 844，全部分类完整显示。
  - `/tmp/codex-plugin-guide-canva-icon-fixed.png` — Canva 图标填满容器内容区状态。
- Combined comparison evidence: `/tmp/codex-plugin-guide-qa-comparison.png`，1800 × 3026 px。
- Round 2 combined comparison evidence: `/tmp/codex-plugin-guide-qa-comparison-round2.png`。
- Density normalization: 来源截图包含约 2× 的桌面截屏；对照板统一按列宽等比缩放，以结构、占位、圆角、阴影、图标视觉占比和内容层级为判断依据，不把像素密度差异记为问题。

## States checked

- 宽屏首页：Hero、分类横向导航、右侧搜索、首组卡片与安装清单。
- 长介绍卡片：Apollo.io 悬停自动展开。
- 长内容详情：Todoist 弹窗首屏、内部滚动、底部官网与开发者。
- 窄屏：390 × 844，分类条与搜索改为上下排列，无横向页面溢出。
- 窄屏第二轮：16 个分类入口自动排成 5 行，全部位于视口内；搜索框位于分类下方且保持完整宽度。
- 交互：搜索、打开/关闭详情、遮罩内独立滚动、悬停介绍。
- Console：未发现 error 或 warning。

## Findings

- 无可执行的 P0、P1 或 P2 问题。
- 字体与排版：继续沿用项目原有 Arial / 苹方回退与字重层级；删除目录大标题后，页面层级仍由 Hero、分类栏、结果行和分类标题清晰承接。
- 间距与布局：分类与搜索位于同一导航区；弹窗滚动条收进内容层，外壳圆角完整；卡片图标容器为 56 px，最新图片主体为 54 px。
- 响应式分类：1500 px 以下分类区改为完整换行，搜索框另起一行靠右；390 px 下无隐藏标签、无横向页面溢出。
- 颜色与视觉令牌：沿用原有纸白、墨黑和荧光绿；弹窗与介绍浮层改用中性边框和柔和透明阴影，不再出现不协调的黑色硬偏移。
- 图像质量：继续使用目录内真实官方图标，没有使用占位图、CSS 图形或重绘图标；放大后清晰度可接受。
- 图标占位：图标图片改为占满 56 px 容器的内容盒，实际渲染为 54 × 54 px，仅留下容器自身的 1 px 描边。
- 文案与内容：插件名称下原生短说明保留；详情底部明确显示官网与开发者；删除的入口和目录标题未残留。

## Focused-region evidence

- 长弹窗右上角与右下角：外壳 `overflow: hidden`、20 px 圆角和柔和阴影均完整，滚动条只出现在内部正文区。
- 长介绍浮层：Apollo.io 展开层使用 1 px 中性边框、12 px 圆角与柔和阴影，取消黑色硬描边和块状偏移。
- 插件图标：卡片头部图标主体最终由 34 px 增至 54 px，在 56 px 容器中只保留描边并维持对齐。
- 第二轮插件图标：Canva 聚焦对照确认图片与容器内容盒之间不再存在额外内边距；官方素材自身的透明区域仍被保留。
- 首页结构：Hero 操作按钮与重复目录标题已删除；搜索框位于分类栏右侧。
- 第二轮分类导航：窄窗口对照确认原先被搜索框截断的后续分类全部换行展示。

## Comparison history

1. Earlier annotated findings: 弹窗右侧圆角被外层滚动条与硬阴影破坏；详情底部缺官网/作者；长介绍浮层样式生硬；插件图标偏小；首页存在重复入口和目录标题，搜索位置错误。
2. Fixes made: 分离弹窗外壳与可滚动正文；新增详情底部链接；替换两处硬阴影；扩大图标；删除冗余入口与目录标题；将搜索并入分类栏。
3. Post-fix evidence: `/tmp/codex-plugin-guide-qa-comparison.png` 的四组并排对照，以及弹窗底部截图 `/tmp/codex-plugin-guide-modal-bottom.png`。
4. Round 2 findings: 中等宽度下单行分类仍缺乏可见的溢出提示；56 px 图标容器内的 46 px 图片留下明显白边。Fixes made: 1500 px 以下分类完整换行并把搜索框移到下一行；图标图片改为填满容器内容盒。Post-fix evidence: `/tmp/codex-plugin-guide-qa-comparison-round2.png`；390 px 下 16 个分类均在视口内，图标与容器之间只剩 1 px 描边。

## Implementation checklist

- [x] 宽屏首页结构与标注一致。
- [x] 长介绍悬停不挤动网格且视觉更轻。
- [x] 长详情弹窗圆角、滚动和底部信息正常。
- [x] 插件图标视觉占比增加。
- [x] 中等与移动宽度下分类标签全部可见。
- [x] 图标不再出现 CSS 产生的额外白色内边。
- [x] 390 px 窄屏无横向页面溢出。
- [x] `npm run lint` 通过。
- [x] `npm run build` 通过。

## Open questions

- 无。

## Follow-up polish

- 暂无阻塞性交付的 P3 项。

final result: passed

## Round 3 — 自适应分类、56px 图标与深色主题（2026-08-29）

### Requested changes

- 分类标签不再依赖固定断点换行，按标签和搜索框的实际宽度自适应换行。
- 插件图片扩大到 56 × 56 px，图标容器保持 56 × 56 px。
- 顶栏增加浅色/深色主题切换；首次打开跟随系统偏好，手动选择后保存在本机。

### Static evidence

- `npx tsc --noEmit`：通过。
- `npm run lint`：通过。
- `npm run build`：通过；仅有现有 `punycode` 弃用、Vite 大 chunk 与 vinext 路由静态分析提示。
- `curl http://localhost:3000/`：HTTP 200；服务端输出包含主题按钮、弹性分类导航和搜索框。
- CSS 检查确认已移除 `category-scroll` 与固定 `max-width:1500px` 换行断点；分类导航为 `flex-wrap`，搜索框使用可收缩的弹性基准。

### Visual QA status

- 目标参考：`/var/folders/11/gc16jzys5tz0v62h1t5x0cmw0000gp/T/codex-clipboard-77a23f82-e405-4e7f-a25d-f158e4f63594.png`（3280 × 236 px）。
- 本轮无法通过内置浏览器截取实现页或执行交互复测：浏览器自动审核额度已耗尽，现有本地页读取也被系统拦截。
- 因此本轮不把自适应换行、图标视觉占比和深色主题的真实浏览器呈现标记为“已通过”；待浏览器额度恢复后，需要复测宽屏、窄屏、主题切换与卡片详情交互。

### Findings

- 代码实现已完成，未发现静态构建阻断项。
- 浏览器视觉验证是外部工具额度阻断，不是已确认的页面缺陷。

final result: blocked
  confidence: medium
  updated_at: 2026-08-29T23:45:00+08:00

## Round 4 — 去除图标外壳（2026-08-29）

### Requested change

- 移除图标外层白色描边/背景容器，保留 56 × 56 px 的图片占位与卡片网格对齐，避免图标周围继续出现漏点和空隙。

### Implementation

- 卡片与详情浮层改用直接的 `.plugin-icon` 图片，不再渲染 `.icon-shell`。
- 保留图片 `object-fit: contain` 与 14 px 圆角；卡片首列和详情标题列仍固定 56 px，避免文字与按钮位置漂移。

### Static evidence

- `npx tsc --noEmit`：通过。
- `npm run lint`：通过。
- `npm run build`：通过。
- `curl http://localhost:3000/`：HTTP 200。
- CSS/JS 检查确认 `.icon-shell` 已移除，卡片与详情均使用 `.plugin-icon`。

### Visual QA status

- 用户参考：`/var/folders/11/gc16jzys5tz0v62h1t5x0cmw0000gp/T/codex-clipboard-4e988618-d422-4d14-990d-12e6f07d9237.png`。
- 内置浏览器自动审核额度仍不可用，本轮无法截取实现页并进行真实视觉对比；因此继续保持 `blocked`，不把静态验证当作视觉通过。

final result: blocked
  confidence: medium
  updated_at: 2026-08-29T23:55:00+08:00

## Round 4 recheck — 浏览器复测（2026-08-30）

### Comparison evidence

- Source: `/var/folders/11/gc16jzys5tz0v62h1t5x0cmw0000gp/T/codex-clipboard-4e988618-d422-4d14-990d-12e6f07d9237.png`，1540 × 934 px，深色主题卡片状态。
- Implementation: `/tmp/codex-plugin-guide-round4-dark.png`，1540 × 934 px，CSS viewport 1540 × 934，深色主题，滚动到精选卡片区域。
- Combined comparison: `/tmp/codex-plugin-guide-round4-comparison.png`，source 与 implementation 并排输入后复核图标处理、卡片边缘和深色主题对比。
- Responsive evidence: `/tmp/codex-plugin-guide-round4-narrow-light.png`，CSS viewport 390 × 844；分类导航完整换行，搜索框未裁切，图片为 56 × 56 px。

### Primary interactions checked

- 深色/浅色主题切换：可切换，页面令牌同步更新；复测结束后恢复浅色主题。
- “查看完整说明”：可打开详情弹层，详情图标为 56 × 56 px，官网链接仍在底部；关闭后弹层消失。
- 窄窗口：390 × 844 下 16 个分类标签全部可见，搜索框右边界为 357 px，无横向溢出。
- 图标外壳：`.icon-shell` 数量为 0；卡片与详情均直接使用 `.plugin-icon`，尺寸为 56 × 56 px，无额外边框或背景。
- Console：未发现 error、warning 或 warning-level 日志。

### Findings

- [P0–P2] 无可执行问题。
- 参考图中的白色圆角底色仅存在于部分官方图标文件本身（例如 GitHub 素材），不是页面额外容器；页面已移除额外外壳，保留官方素材原貌。
- 视觉差异主要来自参考图与实现页的卡片列数、滚动位置和截图密度，不影响本次图标外壳修复目标。

### Required fidelity surfaces

- Fonts and typography：沿用项目既有 Arial / 苹方回退、标题/正文层级；本轮未改字体。
- Spacing and layout rhythm：首列与标题列保持 56 px，移除外壳后文字、按钮和卡片间距未漂移；窄窗口无溢出。
- Colors and visual tokens：深色主题背景、卡片、边框与荧光绿强调色保持一致；主题切换后对比清晰。
- Image quality and asset fidelity：继续使用目录内官方图标；不再叠加白色容器，官方文件自身透明/白底保持原貌。
- Copy and content：插件短说明、产品介绍、官网和开发者信息未受本轮修改影响。

### Implementation checklist

- [x] 移除卡片和详情浮层中的图标外层容器。
- [x] 保留 56 × 56 px 图标尺寸与布局对齐。
- [x] 深色主题卡片与图标视觉复测完成。
- [x] 390 px 窄窗口分类与搜索复测完成。
- [x] 详情弹层与官网链接复测完成。
- [x] `npx tsc --noEmit`、`npm run lint`、`npm run build` 通过。

final result: passed
  confidence: high
  updated_at: 2026-08-30T00:20:00+08:00
