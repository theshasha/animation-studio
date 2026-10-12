# 动画工作室协作指南

本项目用于持续创作动画视频、生成艺术和交互网页。本文件保存项目特有约定；作品源码与说明保存在各自目录中。

## 创作与迭代

继续作品前，阅读作品说明及本次任务相关的交接文档，结合用户当前要求推进。

开始新作品、调整视觉方向或选用资源时，按[设计资源与使用方法](docs/design-resources.md#创作时怎样查阅)查阅。

沿用已确认设计，根据当前问题选择草图、关键帧、分镜、动态实验或局部精修。用实际画面和运动支撑讨论，说明预览的判断目标与未完成部分，兼顾局部细节和整体节奏。

作品说明保存当前创作方向、重要设计约定及参考的具体借鉴点。涉及局部要求时，定位到镜头、元素或交互状态；需要画面对照时，注明对应预览。

## 技能与资料

开始相关工作前，加载匹配技能，并按需读取其参考文件：

| 任务 | 技能 |
| --- | --- |
| 创建或修改 Remotion 作品，处理媒体、预览、渲染或升级 | `remotion-best-practices` |
| 编写或审查 GSAP 属性动画、补间和缓动 | `gsap-core` |
| GSAP 时间轴、标签、嵌套和播放控制 | `gsap-core`、`gsap-timeline` |
| React 中的 GSAP 作用域、事件和生命周期 | `gsap-core`、`gsap-react`；涉及编排时加 `gsap-timeline` |
| 编写或修改代理指引、skill | `writing-for-agents` |

项目技能位于 `.agents/skills/<技能 ID>/SKILL.md`；工具未发现时可直接读取。来源见 [.agents/SOURCES.md](.agents/SOURCES.md)，第三方正文与配套资料保留原文。

p5.js、Three.js 等没有专门技能的工具，查阅官方资料并核对已安装版本。新增技能优先选择官方或可靠社区来源，说明适用性后确认加入。

Remotion 动画由视频帧驱动；网页的实时循环不能直接作为视频实现。组合接入 GSAP、p5 或 Three.js 时，先核对官方集成能力及限制。

## 项目结构

所有作品共用根目录的 npm 依赖和锁文件；Remotion 包保持相同的精确版本。

| 路径 | 用途 |
| --- | --- |
| `src/web/` | Vite 公共入口 |
| `src/video/` | Remotion 入口与作品注册 |
| `src/projects/<作品名>/` | 作品源码与说明；内部结构按作品需要组织 |
| `src/shared/` | 多个作品实际复用的组件与工具 |
| `public/assets/` | 共用素材 |
| `public/projects/<作品名>/` | 作品专用素材，与源码使用相同作品名 |
| `output/<作品名>/` | 成片、静帧、预览与验证产物 |
| `output/web/`、`output/bundle/` | 网页构建与 Remotion 渲染包的生成目录 |
| `scripts/` | 开发、验证和导出辅助脚本 |

新增作品的入口、lint 范围和运行命令见 [README](README.md#新增作品)。

安装、恢复依赖，或更新工具、浏览器、技能前，阅读 [安装与更新指南](docs/setup-and-updates.md)。工具能力与回归检查见 [tool-check](src/projects/tool-check/README.md)。

## 素材与输出

共用素材按 `fonts/`、`images/`、`textures/`、`brushes/`、`icons/`、`models/`、`videos/` 分类；音频放在 `audio/sfx/`、`audio/bgm/`、`audio/voice/`。作品专用素材在作品说明或来源记录中注明来源、授权与用途。技能附带资源保留在技能目录，选用后再加入作品素材。

音效与 BGM 使用用户提供或选定的现成素材，不调用生成工具制作。音乐影响镜头节奏时，先确定音轨再编排。

两个入口共用 `public/`：Remotion 通过 `staticFile()` 读取素材，Vite 公共路径结合 `import.meta.env.BASE_URL` 支持子路径部署。打包会包含整个 `public/`，发布前按交付范围检查素材。

源素材与输出分开存放，文件名区分作品和版本。耗时正式导出前确认分辨率、帧率、时长及输出格式。
