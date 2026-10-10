# 动画工作室

位置：`C:/project/animation-studio`。视频与交互网页使用一套 npm 依赖，作品按各自需要组织。AI 协作与目录职责见 [AGENTS.md](AGENTS.md)。

## 已安装的工具

- Remotion 及官方 Three.js、GSAP、媒体集成。
- React、Vite、TypeScript。
- p5.js 2.x、p5.brush、Three.js、React Three Fiber。
- GSAP、React GSAP 集成、Tweakpane。
- Playwright 及 Chromium，用于按需执行自动化验证。
- TypeScript 和 Remotion 官方 ESLint 配置。

使用本机 Node.js 24，以及 PATH 中已有的 FFmpeg / ffprobe。具体依赖版本见 `package.json` 和 `package-lock.json`。工具实测说明见 [tool-check](src/projects/tool-check/README.md)；水彩使用 p5.brush 独立版，粒子保留 p5，已验证不同初始化顺序、重挂和热更新。同种子重绘只测到极少量像素差异，不能仅凭哈希不同判定视觉问题。

## 启动

在项目根目录按需运行。网页命令通过作品目录名选择入口，例如：

```bash
npm run dev:web -- tool-check
npm run dev:video
```

网页默认地址为 `http://127.0.0.1:5173`，直接展示选中的作品；切换作品时停止服务，再用另一个作品名启动。未传作品名或名称错误时，终端显示用法与可用作品列表，不自动选择。两个预览服务可以单独启动。

Remotion Studio 使用端口 3000，以终端输出的地址为准。`EnvironmentCheck` 显示当前帧号；`ToolCheck` 是可预览、导出的 5 秒三维动效。

## 作品与素材

作品源码、设计和反馈放在 `src/projects/<作品名>/`，内部文件自由组织。网页统一从 `web/App.tsx` 具名导出无需传入属性的 React 组件 `App`。作品目录名使用文字、数字、下划线或短横线，新增作品后即可通过目录名启动，无需修改公共入口或维护作品清单。

`scripts/web.mjs` 检查参数与入口，通过 Vite 别名 `@current-project` 将 `src/web/main.tsx` 连接到选中的作品，并沿用 `vite.config.ts` 配置。所有作品源码仍参与全项目类型检查。视频在 `src/video/Root.tsx` 注册，公共逻辑按需放入 `src/shared/`。

共用素材放在 `public/assets/` 的分类目录，作品专用素材放在 `public/projects/<作品名>/`。音效和 BGM 使用现成素材。素材库初始为空。

## 检查与输出

```bash
npm run check
npm run build:web -- tool-check
npm run build:video
```

网页静态构建只选择指定作品的代码入口，输出到 `output/web/`；该目录用于本次构建，`npm run preview:web` 预览最近一次构建。Remotion 渲染包输出到 `output/bundle/`。两者都会包含根目录 `public/` 的静态素材，网页素材不会按作品筛选，发布前检查素材范围。

导出时显式给出作品 ID 和输出路径，例如环境检查静帧：

```bash
npm run still -- EnvironmentCheck output/environment-check/frame.png --frame=30
```

视频使用 `npm run render -- <作品ID> output/<作品名>/<版本>.mp4`。覆盖已有输出默认关闭，比较版本时使用不同文件名。

## 安装与更新

完整流程见 [安装与更新指南](docs/setup-and-updates.md)，包含首次安装、恢复环境、工具升级、技能更新、验证和回退。技能来源统一记录在 [.agents/SOURCES.md](.agents/SOURCES.md)。

仅恢复现有锁定版本时：

```bash
npm ci
PLAYWRIGHT_SKIP_BROWSER_GC=1 npx playwright install chromium
NODE_USE_ENV_PROXY=1 npx remotion browser ensure
```

Playwright 和 Remotion 使用各自管理的浏览器。Playwright 安装命令保留其他项目可能使用的旧浏览器缓存。npm 依赖更新和 Remotion 版本变动后，重新执行相关检查。

## 开源与仓库内容

项目自有代码与文档采用 [MIT 许可证](LICENSE)。第三方依赖及 `.agents/skills/` 中的技能保留各自的许可与来源，不因本项目采用 MIT 而改变；技能来源见 [.agents/SOURCES.md](.agents/SOURCES.md)。

仓库同时保留现有文档和待审阅的 `.new.md` 版本，后者尚未替换正式文档。视频仅提交网页演示所需的 `public/projects/tool-check/tool-check.mp4`；其他视频、`output/`、依赖目录及本地会话产物不纳入版本管理。说明中引用的成片、静帧和检查记录需在本地生成。
