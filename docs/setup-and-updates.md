# 安装与更新指南

命令在项目根目录的 Git Bash 中执行。示例中的 `<目标版本>` 等占位符需替换为实际值。

## 安装或迁移

### 环境与项目文件

- 安装 Node.js 24.x、Git for Windows，并让 FFmpeg / ffprobe 位于 PATH 中。本机 FFmpeg 通过 Scoop 管理。
- 克隆 `https://github.com/theshasha/animation-studio.git`，或复制项目源码、隐藏配置、依赖清单及锁文件、`.agents/` 和所需 `public/` 素材。未纳入 Git 的本地素材与历史输出按需另行复制；`node_modules/` 可从锁文件恢复。

确认工具可用：

```bash
node --version
npm --version
git --version
ffmpeg -version
ffprobe -version
```

### 依赖与浏览器

```bash
npm ci
PLAYWRIGHT_SKIP_BROWSER_GC=1 npx playwright install chromium
NODE_USE_ENV_PROXY=1 npx remotion browser ensure
```

`npm ci` 按锁文件重建依赖。Playwright 与 Remotion 分别管理浏览器；`PLAYWRIGHT_SKIP_BROWSER_GC=1` 保留其他项目可能使用的旧浏览器缓存。

遇到安装脚本未获允许的提示时，用 `npm install-scripts ls` 查看具体脚本，再根据依赖说明及实际失败处理。

安装后执行下文验证，预览命令见 [README](../README.md)。

## 下载代理

Node 使用环境代理时，除 `HTTP_PROXY` / `HTTPS_PROXY` 外，还需要启用：

```bash
export NODE_USE_ENV_PROXY=1
```

`NO_PROXY` 应包含 `localhost,127.0.0.1`，让本地服务直连。排查时查看当前进程实际环境：

```bash
node -p "process.env.NODE_USE_ENV_PROXY"
node -p "process.env.NO_PROXY"
```

修改 Windows 用户环境变量后，已运行的终端和桌面应用需重新启动才能继承。命令前的 `NODE_USE_ENV_PROXY=1` 可直接作用于本次运行；自定义网络客户端是否读取代理仍取决于其实现。

## 更新依赖与工具

更新前保存源码、依赖清单和锁文件的可恢复版本，停止受影响的服务。按工具组更新，便于定位问题和回退。

### Remotion

```bash
npm view remotion version
npx remotion upgrade --help
npx remotion upgrade --version=<目标版本> --package-manager=npm --skip-skills
npx remotion versions
NODE_USE_ENV_PROXY=1 npx remotion browser ensure
```

`remotion` 与 `@remotion/*` 保持相同的精确版本。项目技能为手动维护的固定提交副本，使用 `--skip-skills` 将软件升级与技能更新分开。新增 Remotion 包使用 `npx remotion add <包名>` 对齐版本。

### 其他 npm 依赖

```bash
npm outdated
npm view <包名>@<目标版本> peerDependencies engines --json
npm install --save-exact <包名>@<目标版本>
```

开发依赖加 `-D`，依赖清单与锁文件一起保存。项目使用精确版本，`npm outdated` 的 Wanted 与 Latest 可能不同。

更新时关注实际集成关系：React 与 R3F，Three.js 与 R3F / Remotion / 类型声明，GSAP 与 React / Remotion 集成，Tweakpane 与其核心类型，以及 Vite / ESLint 对 Node、TypeScript 的支持。p5 与 p5.brush 的回归范围见 [工具演示](../src/projects/tool-check/README.md)。

### Playwright、Node 与 FFmpeg

Playwright 更新后安装匹配的浏览器：

```bash
npm install -D --save-exact playwright@<目标版本>
PLAYWRIGHT_SKIP_BROWSER_GC=1 npx playwright install chromium
```

Node 沿原安装渠道更新到项目 `engines` 支持的版本；npm 通常随 Node 更新。单独更新 npm 前核对其 Node 要求。

本机 FFmpeg 更新命令：

```bash
scoop update
scoop update ffmpeg
ffmpeg -version
ffprobe -version
```

系统 FFmpeg 与 Remotion 自带媒体处理组件分别维护。

## 恢复与更新技能

技能保存在 `.agents/skills/`，随项目纳入 Git 版本管理。来源地址、版本或提交号及必要的本地修改说明记录在 [.agents/SOURCES.md](../.agents/SOURCES.md)。

### 恢复

克隆项目即可获得仓库中的技能。需要恢复旧版本时，通过 Git 历史找到对应版本，核对本地改动后恢复所需技能目录及对应来源记录。

### 更新

1. 根据来源记录找到上游，查看变化并选定适用版本；本地来源的技能从对应来源获取。
2. 将选定版本放到临时目录，与现有内容比较后更新技能及配套文件。Remotion 保留总入口及完整配套目录；GSAP 保留所选三个技能及许可证。留意上游改名或移除的文件，避免新旧混杂。
3. 更新 `.agents/SOURCES.md` 中的来源、版本或提交号，以及必要的本地修改说明。
4. 检查 Git 差异、技能入口、相对链接和技能发现结果。

技能原文保留英文，项目约定维护在 `AGENTS.md`。

## 验证与回退

按受影响范围选择检查；工具链整体更新至少执行：

```bash
npm ls --depth=0
npx remotion versions
npm run check
npm run build:web -- tool-check
npm run build:video
npx remotion compositions src/video/index.ts
```

网页交互回归及产物位置见 [工具演示的重跑检查](../src/projects/tool-check/README.md#重跑检查)。视频导出、完整解码与重复帧检查见 [视频说明](../src/projects/tool-check/video/README.md#导出与复测)，使用新的输出版本名保留对照。

升级失败时，恢复对应源码、`package.json`、锁文件及技能版本，运行 `npm ci`，再恢复匹配浏览器并验证受影响功能。素材和历史成片独立保留。
