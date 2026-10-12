# 设计资源与使用方法

供网页与视频创作选用资源、查阅实现。依据 Mocubix、Relume Icons、Radix 的官方资料、源码和发布文件整理，核查日期为 **2026-10-11**。资源和依赖按作品需求引入，已安装项见 `package.json`。

**共享资源和使用方法，每件作品确定视觉配置。**参考项目中的字体、配色、排版和运动由作品分别选用。

## 创作时怎样查阅

1. 围绕作品内容、受众、媒介和当前视觉问题查阅资源速查；入口不足时，明确缺口再补充搜索。
2. 提出新的视觉选择前，查看实际画面或演示。字体关注中文覆盖与混排，图标比较线宽和小尺寸辨识度，动效查看完整运动；借鉴实现时读对应源码与样式。
3. 说明资源来源、具体借鉴点、使用位置及适合的原因。搭配尚需判断时，按确认方案用实际内容制作代表性画面或短动态。
4. 将影响后续创作的资源用途、设计约束和必要原因并入作品说明，已实现参数引用代码。

引入时核对具体版本的授权与技术要求，记录来源；移植代码保留版本或提交号及许可证。素材位置和复用约定见 [AGENTS.md](../AGENTS.md)。

## 资源速查

| 需要解决的问题 | 优先查阅 | 可取得或借鉴的内容 |
| --- | --- | --- |
| 标题与正文字体 | [Fontshare](https://www.fontshare.com/)、[Fontsource](https://fontsource.org/) | 字体预览、字重与可变字体、加载方式；参考 Mocubix 的字体角色分配 |
| 中文及多文字系统 | 思源字体、Noto；结合 Mocubix 的实际用法 | 检查字符覆盖、标点、混排及竖排 |
| 界面图标 | [Relume Icons](https://icons.relume.ai/)、[Iconify](https://iconify.design/)、[Radix Icons](https://www.radix-ui.com/icons) | 预览、选择、SVG 或框架组件；一个作品先确定统一的图标风格 |
| 控件与界面一致性 | [Radix Themes](https://www.radix-ui.com/themes/docs/overview/getting-started) | 已有样式的 React 组件、布局工具、主题参数 |
| 定制外观的交互组件 | [Radix Primitives](https://www.radix-ui.com/primitives/docs/overview/introduction) | 无样式的行为基础，包含焦点和键盘交互等 |
| 界面色彩与状态 | [Radix Colors](https://www.radix-ui.com/colors) | 有用途划分的色阶、明暗配色；适合作为界面颜色基础 |
| 摄影、历史及艺术图像 | [Wikimedia Commons](https://commons.wikimedia.org/)、Mocubix 素材脚本 | 素材来源、作者与授权元数据、多尺寸图像、图像处理方法 |
| 动效选择与实现 | [Mocubix Lexicon](https://mocubix.renocrypt.com/lexicon/) | 具名效果、实际演示及对应源码，覆盖滚动、图像、字体和色彩 |

候选资源尚未逐项完成安装测试与授权审查。代码许可证仅覆盖相应代码，字体、图片和图标按各自授权处理。

字体、颜色、SVG 等可供网页与视频共享；滚动、实时循环、随机和有历史状态的动画用于 Remotion 时，需适配为可确定的帧驱动。

## Mocubix：字体、素材与动效实现

[演示站](https://mocubix.renocrypt.com/) · [源码仓库](https://github.com/renocrypt/mocubix) · [页面与源码索引](https://mocubix.renocrypt.com/llms.txt)

### 实际使用的资源

| 资源 | 项目中的用途 |
| --- | --- |
| Fontshare：Melodrama | 站点及 Lexicon 主标题 |
| Fontshare：Switzer | 正文及部分数字显示 |
| Fontshare：Boska、Panchang、Zodiak、Gambetta、Khand、Rowan、Tanker | 七个展品各自的标题字体 |
| Geist Mono Variable | 标签、导航、读数；通过 jsDelivr 加载 Fontsource 包 |
| Source Han Serif SC（思源宋体）、Noto | 中文、日文及多文字系统示例 |
| Wikimedia Commons | 摄影、艺术扫描件、天文与历史图像 |
| 自制 SVG / CSS 图形 | 标志、源码链接图标、主题切换图形 |

可借鉴标题、正文与读数的字体分工，以及各展品按主题选择标题字体的方法。

### 实现与素材处理

- 以原生 HTML、CSS 和小型 JavaScript 为主。
- 滚动动画使用 `animation-timeline`、`animation-range`、`@property` 等浏览器能力；部分实时运动使用 `requestAnimationFrame`。
- `site/house.css` 集中定义颜色、字体角色、导航样式与缓动。
- `site/house.js` 处理主题记忆、主题切换和公共图标；支持时使用 View Transitions 完成切换。
- `site/parts/split-flap.js` 是可通过属性、方法与 CSS 变量定制的翻页牌 Web Component，使用实时循环、Web Animations API 和随机差异。
- 素材处理使用 Python；配色提取使用 Pillow 和 OKLab。

| 文件 | 用途 |
| --- | --- |
| `build/curate.py` | 从 Commons API 获取实际可用的图片地址、尺寸、作者、授权、来源页及多分辨率版本，生成 `srcset` 数据 |
| `assets/curated.json` | 保存整理后的素材元数据 |
| `build/palette.py` | 从图像提取背景色、文字色与强调色，并调整明度；保存到 `assets/palettes.json` |

从 Lexicon 定位效果及源码，再按作品需求选择原生 CSS 或已有工具实现。Mocubix 以特定 Chrome 环境为目标，使用其较新 CSS 能力时核对浏览器支持。仓库原创代码采用 Apache-2.0。

**主要证据：**[首页源码](https://github.com/renocrypt/mocubix/blob/main/site/index.html)、[house.css](https://github.com/renocrypt/mocubix/blob/main/site/house.css)、[house.js](https://github.com/renocrypt/mocubix/blob/main/site/house.js)、[翻页牌组件](https://github.com/renocrypt/mocubix/blob/main/site/parts/split-flap.js)、[素材整理](https://github.com/renocrypt/mocubix/blob/main/build/curate.py)、[配色提取](https://github.com/renocrypt/mocubix/blob/main/build/palette.py)、[项目设计与实现约定](https://github.com/renocrypt/mocubix/blob/main/AGENTS.md)。

## Relume Icons：图标资源与统一处理

[演示站](https://icons.relume.ai/)

依据线上 HTML、CSS 与 JavaScript 核查，未确认该定制站点的公开源码仓库。

### 实际使用的资源

- **Relative 字体**：正文使用 `Relative`，CSS 定义 Book、Medium、Bold，对应 400、500、700；授权尚待核查。
- **中性色样式**：浅背景 `#F1F0EE`、灰背景 `#E4E2DF` 和深色 `#161616`。
- **图标集合**：Google Material Icons、BoxIcons、Iconoir、Carbon、Tabler、Phosphor、Feather Icon、Simple Icons、Heroicons。页面提供作者和授权信息，上游链接也保留在构建文件中。

### 图标选用

站点使用 Iconify 处理图标数据，提供 SVG 下载和 Webflow 剪贴板输出。用它比较图标后，确定作品的图标集、线宽和尺寸，再选择 Iconify、上游 SVG 或 React 组件接入。SVG 保留 `viewBox`，并协调颜色继承。

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

官网在 Themes 之外定制了商业字体、随字号变化的字距、字重和文字边缘调整；部分产品示例使用系统字体。复用官网外观需单独选定字体与排版。

官网使用 React + Next.js、Radix 和 CSS Modules。`MagicCurtain` 通过 React 状态控制 CSS `clip-path`、透明度及变换动画。Radix 组件可直接用于 React + Vite；移植官网代码时需替换 `next/font/local` 和路由等专用部分。官网原创代码采用 MIT。

### 产品选用

| 产品 | 适用方式 |
| --- | --- |
| Themes | 控制面板、表单和应用界面；通过组件参数与主题变量调整外观 |
| Primitives | 需要定制外观时复用交互行为；本身不提供成品样式 |
| Colors | 用明确用途的色阶组织背景、边框、文字和交互状态 |
| Icons | 适合小尺寸界面图标；设计网格为 15×15，放大展示时仍需判断视觉效果 |

Colors 的 12 阶主要用途：1–2 背景，3–5 组件默认／悬停／选中背景，6–8 边框，9–10 实色背景及其悬停状态，11–12 文字。配色需按[官方色阶说明](https://www.radix-ui.com/colors/docs/palette-composition/understanding-the-scale)核对前景色与对比关系。

Themes 优先通过参数和主题配置定制；需要大量覆盖样式时评估 Primitives，见[官方样式指南](https://www.radix-ui.com/themes/docs/overview/styling)。视频中的界面演示还需检查弹层、状态、字体加载和动画的帧可控性。

**主要证据：**[依赖清单](https://github.com/radix-ui/website/blob/402e749613ab2e7ab7139c65b0029842b0360f07/package.json)、[根布局与字体加载](https://github.com/radix-ui/website/blob/402e749613ab2e7ab7139c65b0029842b0360f07/app/layout.tsx)、[排版覆盖](https://github.com/radix-ui/website/blob/402e749613ab2e7ab7139c65b0029842b0360f07/pages/styles.css)、[标题组件](https://github.com/radix-ui/website/blob/402e749613ab2e7ab7139c65b0029842b0360f07/components/serif-heading.tsx)、[切换动画](https://github.com/radix-ui/website/blob/402e749613ab2e7ab7139c65b0029842b0360f07/components/magic-curtain.module.css)。

维护本文时，区分源码证据、官方说明与推断，更新来源及核查日期。
