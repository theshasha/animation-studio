# 设计资源与使用方法

供动画视频与交互网页创作时选用资源、查阅实现。整理依据是 Mocubix、Relume Icons、Radix 三个项目的官方资料、公开源码和线上构建文件，核查日期为 **2026-10-11**。

## 使用原则与当前状态

- **共享资源和使用方法，每件作品确定视觉配置。**共用的是资源入口、组件能力和组织方法；字体、配色、排版、图标及运动节奏由作品决定。
- 网页继续使用 React + Vite，视频继续使用 Remotion。参考项目采用 Next.js 或 Vue，不构成本项目更换框架的理由。
- 本文中的“实际使用”描述参考项目；“适用方式”是本工作室的选用建议，不表示已经接入。
- 本次整理没有安装新依赖、下载字体或图标、移植组件。当前依赖以根目录 `package.json` 为准。
- 不将参考项目的特定审美、浏览器限制或代理指令当成本项目的通用规则。英文案例的字体与字距也不能直接当作中文排版方案。

## 创作时怎样查阅

1. 阅读作品已有设计与反馈，根据需要查字体、图标、界面、素材和动效入口。
2. 提出本次的具体选用结果：资源名称、用途、关键规格，以及采用哪个效果或实现。涉及设计与实现选择时，按项目约定讨论确认。
3. 用代表性画面或短动态检查搭配效果，将确认结果记入作品现有说明。记录具体选择及原因，不只写“高级”“简洁”等形容词。
4. 引入资源时核对上游授权与技术要求，记录来源。选择共享素材或作品专用素材的位置，遵循根目录 `AGENTS.md`。
5. 多个作品实际复用的代码再提取到 `src/shared/`；网页事件与实时循环、视频帧驱动逻辑分别处理。

作品说明通常需要记录：字体及字重与中文覆盖、配色及用途、排版层级、图标集与规格、素材来源、主要动效参考与驱动方式。具体代码配置按作品需要组织。

## 资源速查

| 需要解决的问题 | 优先查阅 | 可取得或借鉴的内容 |
| --- | --- | --- |
| 标题与正文字体 | [Fontshare](https://www.fontshare.com/)、[Fontsource](https://fontsource.org/) | 字体预览、字重与可变字体、加载方式；参考 Mocubix 的字体角色分配 |
| 中文及多文字系统 | 思源字体、Noto；结合 Mocubix 的实际用法 | 检查字符覆盖、标点、混排及竖排；不能以字体加载成功代替显示检查 |
| 界面图标 | [Relume Icons](https://icons.relume.ai/)、[Iconify](https://iconify.design/)、[Radix Icons](https://www.radix-ui.com/icons) | 预览、选择、SVG 或框架组件；一个作品先确定统一的图标风格 |
| 控件与界面一致性 | [Radix Themes](https://www.radix-ui.com/themes/docs/overview/getting-started) | 已有样式的 React 组件、布局工具、主题参数 |
| 定制外观的交互组件 | [Radix Primitives](https://www.radix-ui.com/primitives/docs/overview/introduction) | 无样式的行为基础，包含焦点和键盘交互等 |
| 界面色彩与状态 | [Radix Colors](https://www.radix-ui.com/colors) | 有用途划分的色阶、明暗配色；适合作为界面颜色基础 |
| 摄影、历史及艺术图像 | [Wikimedia Commons](https://commons.wikimedia.org/)、Mocubix 素材脚本 | 素材来源、作者与授权元数据、多尺寸图像、图像处理方法 |
| 动效选择与实现 | [Mocubix Lexicon](https://mocubix.renocrypt.com/lexicon/) | 具名效果、实际演示及对应源码，覆盖滚动、图像、字体和色彩 |

上表是从这三个项目提取的入口，不是全部资源已完成可用性或授权审查的清单。字体与图标以具体选用的上游版本为准。

## Mocubix：字体、素材与动效实现

[演示站](https://mocubix.renocrypt.com/) · [源码仓库](https://github.com/renocrypt/mocubix) · [页面与源码索引](https://mocubix.renocrypt.com/llms.txt)

### 实际使用的资源

| 资源 | 项目中的用途 | 适用方式 |
| --- | --- | --- |
| Fontshare：Melodrama | 站点及 Lexicon 主标题 | 作为展示字体候选，不固定为工作室默认字体 |
| Fontshare：Switzer | 正文；也承担部分数字显示 | 借鉴标题、正文与数字分工的方法 |
| Fontshare：Boska、Panchang、Zodiak、Gambetta、Khand、Rowan、Tanker | 七个展品各自的标题字体 | 公共正文和导航保持一致，标题按主题选择 |
| Geist Mono Variable | 标签、导航、读数；通过 jsDelivr 加载 Fontsource 包 | 等宽字体候选及可变字体加载参考 |
| Source Han Serif SC（思源宋体）、Noto | 中文、日文及多文字系统示例 | 字符覆盖与混排参考，具体用法需检查对应页面 |
| Wikimedia Commons | 摄影、艺术扫描件、天文与历史图像 | 获取资源的同时保存作者、授权和来源页 |
| 自制 SVG / CSS 图形 | 站点标志、源码链接图标、主题切换图形 | 简单图形可以独立实现，无需为此引入整套库 |

首页源码直接列出了 Fontshare 与 Geist Mono 的加载地址；其他字体用法由项目说明及对应页面确认。jsDelivr 是分发渠道，Fontsource 是字体包来源，二者都不替代字体本身的授权。

### 实际使用的实现基础

- 以原生 HTML、CSS 和小型 JavaScript 为主，没有默认引入 React、GSAP 或 Three.js。
- 滚动动画使用 `animation-timeline`、`animation-range`、`@property` 等浏览器能力；部分实时运动使用 `requestAnimationFrame`。
- `site/house.css` 集中定义背景、文字、强调色、字体角色、公共导航样式与缓动。站点的缓动值为 `cubic-bezier(.16,.84,.24,1)`，这是它的设计选择，并非通用最佳值。
- `site/house.js` 处理主题记忆、主题切换和公共图标；支持时使用 View Transitions 完成切换。
- `site/parts/split-flap.js` 将翻页牌封装为独立 Web Component，通过属性、方法与 CSS 变量定制。其实现包含共享实时循环、Web Animations API、随机差异和可选的 Web Audio 合成声。
- 构建与素材处理使用 Python 脚本；配色提取脚本使用 Pillow 和 OKLab。

### 值得复用的素材处理方法

| 文件 | 已查到的职责 |
| --- | --- |
| `build/curate.py` | 从 Commons API 获取实际可用的图片地址、尺寸、作者、授权、来源页及多分辨率版本，生成 `srcset` 数据 |
| `assets/curated.json` | 保存整理后的素材元数据 |
| `build/palette.py` | 从图像提取背景色、文字色与强调色，并调整明度；保存到 `assets/palettes.json` |

仓库还提供占位图、图像配准与拼接、轮廓提取等脚本。此次主要核查了素材整理和配色提取；其他脚本需在选用时进一步检查输入条件与实现。

### 在本项目中使用

- 将 Lexicon 当作可浏览的效果与源码目录。先明确效果名称、目的和驱动方式，再决定用原生 CSS 还是项目已有工具实现。
- 字体角色、配色、SVG 和素材处理思路可用于网页与视频。
- 滚动时间轴、实时循环、Web Component 动画不能直接作为 Remotion 的帧驱动实现；随机和有历史状态的行为也需要适配。
- 翻页牌的合成音效实现不纳入我们的音频方案；本项目仍使用用户提供或选定的现成音效和 BGM。
- Mocubix 以特定 Chrome 环境为目标。采用其较新的 CSS 能力时，按本作品的浏览器需求核对支持情况。
- 仓库原创代码采用 Apache-2.0；图片与字体保留各自授权，使用时分别记录。

**主要证据：**[首页源码](https://github.com/renocrypt/mocubix/blob/main/site/index.html)、[house.css](https://github.com/renocrypt/mocubix/blob/main/site/house.css)、[house.js](https://github.com/renocrypt/mocubix/blob/main/site/house.js)、[翻页牌组件](https://github.com/renocrypt/mocubix/blob/main/site/parts/split-flap.js)、[素材整理](https://github.com/renocrypt/mocubix/blob/main/build/curate.py)、[配色提取](https://github.com/renocrypt/mocubix/blob/main/build/palette.py)、[项目设计与实现约定](https://github.com/renocrypt/mocubix/blob/main/AGENTS.md)。

## Relume Icons：图标资源与统一处理

[演示站](https://icons.relume.ai/)

此次核查依据为线上 HTML、CSS 与 JavaScript。未确认该定制站点的公开源码仓库，因此不提供未经验证的源码安装方案。

### 实际使用的资源

- **Relative 字体**：线上 CSS 定义 Book、Medium、Bold，分别为 400、500、700，并在正文使用 `Relative`。
- **中性色样式**：包括浅背景 `#F1F0EE`、灰背景 `#E4E2DF` 和深色 `#161616`。这些是该站点配色，不是通用主题库。
- **图标集合**：Google Material Icons、BoxIcons、Iconoir、Carbon、Tabler、Phosphor、Feather Icon、Simple Icons、Heroicons。页面提供作者和授权信息，上游链接也保留在构建文件中。

### 实际使用的实现基础

| 基础 | 核查依据与作用 |
| --- | --- |
| Vue 3、Vue Router | 发布脚本包含 Vue 运行时和 Vue Router 版本标记 |
| Vite | HTML 的构建入口及 PWA 注册脚本标记 |
| UnoCSS | 发布 CSS 中的工具类和 `--un-*` 生成变量 |
| Iconify | 发布脚本包含 Iconify 代码、图标数据处理及 API 配置 |
| Dexie / IndexedDB、本地存储 | 图标集合缓存，以及集合、尺寸、选择等偏好的存储代码 |
| JSZip、SVG 转换与打包逻辑 | 下载多个 SVG，以及其他导出功能的代码基础 |
| Webflow 剪贴板数据格式 | 将图标包装为 Webflow 可粘贴的数据；这是输出能力，不是网站构建方式 |

代码中保留了 `icones-*` 存储键和 `Iconify Explorer Font` 等命名，与 [Icônes](https://github.com/antfu/icones) 有明显关联。但未确认具体派生版本，不能用 Icônes 当前依赖清单代替该站点实际依赖。

### 在本项目中使用

- 用 Relume 浏览与比较图标；落实到作品时选择一套图标及合适的字重、线宽、尺寸，避免无依据地混用。
- Iconify 的价值是统一不同图标集的数据和接入方式。可按作品需要使用它，也可直接使用上游 SVG 或 React 组件，不要求引入 Vue。
- SVG 可用于网页与视频；选定后保存本地素材或使用合适的包，保留 `viewBox` 并协调颜色继承。具体加载方式在接入时决定。
- Relative 字体没有在此次调查中完成授权核查。字体文件可访问不等于可自由复制。
- 各图标集授权不同，以选用时的上游说明为准；本次未下载或建立本地图标全集。

**主要证据：**[发布 CSS](https://icons.relume.ai/assets/index.bbd3fdf8.css)、[发布 JavaScript](https://icons.relume.ai/assets/index.9a12493d.js)。这些带哈希的地址可能随网站更新失效，复查时从首页 HTML 获取新入口。

## Radix：界面基础与官网定制层

[官网](https://www.radix-ui.com/) · [官网源码](https://github.com/radix-ui/website)

官网调查对应源码提交 [`402e749`](https://github.com/radix-ui/website/tree/402e749613ab2e7ab7139c65b0029842b0360f07)，并与线上 HTML 的字体和主题配置交叉核对；未确认线上部署与该提交完全一致。

### 官网实际使用的设计资源

| 资源 | 实际用途 |
| --- | --- |
| Untitled Sans Regular / Medium | 正文、导航和普通界面；官网把主题的 `bold` 也映射到 500 |
| Söhne Mono Buch | 代码字体 |
| Adobe Text Pro Regular | 首页衬线标题等展示文字 |
| Radix Icons、Radix Colors | 图标、界面颜色与主题 |
| 内联 SVG 渐变 | 首页部分抽象背景 |
| WorkOS Imgix、Unsplash 图像 | 预览及部分示例中的图片；Imgix 是分发与处理服务，不是图片授权来源 |

三套字体通过 `next/font/local` 加载。官网另外设置了按字号变化的字距、字重和文字边缘调整。部分产品示例使用 Themes 默认系统字体，并不沿用官网全部字体设置。

**安装 Radix Themes 不会自动获得官网的字体和全部排版效果。**商业字体与第三方图片也不随官网代码许可证自动获得复用授权。

### 官网实际使用的实现基础

- React + Next.js，结合 Radix Themes、Radix Primitives、Radix Icons 和 CSS Modules。
- 首页实际组合了公共页头、衬线标题、代码块、展示布局，以及仪表盘、电商、音乐应用等示例。
- `MagicCurtain` 切换使用 CSS `clip-path`、透明度和变换动画，由 React 管理状态；部分交互使用 Primitives 的 `NavigationMenu`。
- 此次在直接依赖与已核查调用中未发现 GSAP、Motion / Framer Motion、React Spring。`bezier-easing` 用于颜色生成器，不能据此认定它是官网动画引擎。

### 可直接选用的产品基础

| 产品 | 适用方式 |
| --- | --- |
| Themes | 控制面板、表单和应用界面；通过组件参数与主题变量调整外观 |
| Primitives | 需要定制外观时复用交互行为；本身不提供成品样式 |
| Colors | 用明确用途的色阶组织背景、边框、文字和交互状态 |
| Icons | 适合小尺寸界面图标；设计网格为 15×15，放大展示时仍需判断视觉效果 |

Colors 的 12 阶主要用途：1–2 背景，3–5 组件默认／悬停／选中背景，6–8 边框，9–10 实色背景及其悬停状态，11–12 文字。具体前景色和对比关系须结合[官方色阶说明](https://www.radix-ui.com/colors/docs/palette-composition/understanding-the-scale)，不能任意组合后假定都合适。

### 在本项目中使用

- Radix 组件可用于 React + Vite，无需更换 Next.js。移植官网组件时才需要替换 `next/font`、路由等专用部分。
- Themes 适合通过现有参数和主题配置使用；若需要大量覆盖内部样式，优先评估 Primitives 等基础部件。见[官方样式指南](https://www.radix-ui.com/themes/docs/overview/styling)。
- 颜色、排版参数、SVG 和合适的展示组件可供同一作品的网页与视频共享。视频中的界面演示需另行检查弹层、状态、字体加载及动画的帧可控性。
- 官网原创代码为 MIT；字体、图片、标识与具体依赖按各自授权处理。

**主要证据：**[依赖清单](https://github.com/radix-ui/website/blob/402e749613ab2e7ab7139c65b0029842b0360f07/package.json)、[根布局与字体加载](https://github.com/radix-ui/website/blob/402e749613ab2e7ab7139c65b0029842b0360f07/app/layout.tsx)、[排版覆盖](https://github.com/radix-ui/website/blob/402e749613ab2e7ab7139c65b0029842b0360f07/pages/styles.css)、[标题组件](https://github.com/radix-ui/website/blob/402e749613ab2e7ab7139c65b0029842b0360f07/components/serif-heading.tsx)、[切换动画](https://github.com/radix-ui/website/blob/402e749613ab2e7ab7139c65b0029842b0360f07/components/magic-curtain.module.css)。

## 接入位置与后续决定

| 内容 | 本项目位置 |
| --- | --- |
| 作品的设计选择、参考与反馈 | `src/projects/<作品名>/` 内的现有说明 |
| 共用字体、图标、图像等 | `public/assets/` 对应分类，实际选用后加入 |
| 作品专用素材 | `public/projects/<作品名>/` |
| 多作品实际复用的组件与函数 | `src/shared/` |
| 素材整理、转换与检查脚本 | `scripts/`，确有重复需求时加入 |

下一步按实际创作需要决定首批字体与中文搭配、图标集、Radix 接入范围，以及是否移植素材处理脚本。本文没有预先选定统一字体、固定风格预设、公共配置 API 或全量素材包。

维护本文时，区分源码证据、官方说明与推断；更新来源及核查日期。正式移植第三方代码时记录所采用的提交或版本，并保留相应许可证。
