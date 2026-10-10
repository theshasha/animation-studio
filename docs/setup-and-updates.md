# 安装与更新指南

命令使用 Windows 11 的 Git Bash，在 `C:/project/animation-studio` 根目录执行。尖括号中的内容是占位符，执行前替换成已选定的实际版本。本指南描述维护方式，不表示已经执行更新。

## 首次安装或迁移

### 基础工具

1. 从 [Node.js 官网](https://nodejs.org/en/download) 安装 **24.x**，附带 npm。本项目 `engines` 当前限定 Node 24.x，其他主版本需要先验证。
2. 安装 [Git for Windows](https://git-scm.com/downloads/win)，使用 Git Bash。
3. 安装 FFmpeg，确保 `ffmpeg` 和 `ffprobe` 在 PATH 中。本机使用 Scoop；已安装 Scoop 时执行 `scoop install ffmpeg`。其他机器可以从 [FFmpeg 官网](https://ffmpeg.org/download.html) 选择 Windows 构建，把解压后的 `bin` 目录加入 PATH。
4. Python 3 仅用于历史技能补齐脚本，日常 npm 创作不需要它。

重开终端确认：

```bash
node --version
npm --version
git --version
ffmpeg -version
ffprobe -version
```

### 项目文件与目录

从 GitHub 克隆 `https://github.com/theshasha/animation-studio.git`，或复制完整项目源码，包括隐藏的 `.agents/`、`.npmrc`、`AGENTS.md`、`package.json`、`package-lock.json` 和所需 `public/` 素材。`node_modules/` 可重新安装；仓库未收录的本地素材和 `output/` 历史产物按需另行复制。

```bash
cd /c/project/animation-studio
mkdir -p src/web src/video src/projects src/shared scripts output
mkdir -p public/projects public/assets/{fonts,images,textures,brushes,icons,models,videos}
mkdir -p public/assets/audio/{sfx,bgm,voice}
```

`mkdir -p` 用于补回复制或版本管理时遗漏的空目录，不会覆盖已有文件。

### 安装依赖与浏览器

```bash
npm ci
PLAYWRIGHT_SKIP_BROWSER_GC=1 npx playwright install chromium
NODE_USE_ENV_PROXY=1 npx remotion browser ensure
```

`npm ci` 按锁文件重建 `node_modules/`，适合首次安装、恢复环境和回退。修改了 `package.json` 才用 `npm install` 更新锁文件；不要删除锁文件来绕过依赖冲突。

Playwright 与 Remotion 管理各自的浏览器，两条安装命令都需要执行。`PLAYWRIGHT_SKIP_BROWSER_GC=1` 保留其他项目可能需要的旧浏览器缓存。

如果 npm 提示某个依赖的安装脚本未获允许，用 `npm install-scripts ls` 检查具体脚本，根据官方说明和实际失败决定是否批准。本机曾出现 esbuild 脚本提示，但当前网页、视频构建均已通过，不需要因此批量批准脚本。

安装后执行本指南末尾的验证，再按根目录 README 启动网页与 Studio。

## 代理与下载

仅设置 `HTTP_PROXY` / `HTTPS_PROXY` 地址，不一定会让 Node 使用代理。支持该功能的 Node 需要启用 `NODE_USE_ENV_PROXY=1`。当前 Git Bash 中设置：

```bash
export NODE_USE_ENV_PROXY=1
```

本机已保存 Windows 当前用户的同名永久环境变量，且 `NO_PROXY` 包含 `localhost,127.0.0.1`。新机器可以在“编辑账户的环境变量”中添加开关；代理地址使用该机器自己的配置。保留已有 `NO_PROXY` 条目并让本地开发地址直连。

已运行的终端、OpenChamber 和 OpenCode 后台服务不会自动继承新变量，需重新启动相应进程。检查当前环境：

```bash
node -p "process.env.NODE_USE_ENV_PROXY"
node -p "process.env.NO_PROXY"
```

安装浏览器命令中的显式前缀也适用于尚未刷新的终端。使用自定义网络客户端的程序不一定遵循此开关。单次临时关闭可用 `NODE_USE_ENV_PROXY=0 node <脚本>`。

## 更新工具和依赖

更新前保存源码、`package.json` 和 `package-lock.json` 的可恢复副本，停止受影响的开发服务。已使用 Git 时由用户决定版本记录方式，未使用 Git 时复制备份即可。不同工具组分开更新，失败时更容易定位。

### Remotion

```bash
npm view remotion version
npx remotion upgrade --help
npx remotion upgrade --version=<目标版本> --package-manager=npm --skip-skills
npx remotion versions
NODE_USE_ENV_PROXY=1 npx remotion browser ensure
```

先核对目标版本发行说明，再统一升级已安装的 `remotion` 和 `@remotion/*`，保持同一个精确版本。本项目技能是固定提交的手动副本，`--skip-skills` 将软件升级和技能更新分开，随后按下节同步技能。省略此选项的官方命令会尝试更新技能，但不会维护本项目自定义的来源记录。

新加 Remotion 包使用 `npx remotion add <包名>`，使版本与项目对齐。

### p5、Three.js、GSAP、Vite 等

```bash
npm outdated
npm view <包名>@<目标版本> peerDependencies engines --json
npm install --save-exact <包名>@<目标版本>
```

开发工具使用 `npm install -D --save-exact <包名>@<目标版本>`。保存 `package.json` 和锁文件一起更新。

本项目多数依赖采用精确版本，`npm update` 通常不会越过已锁定的约束。`npm outdated` 的 Wanted 是约束允许的版本，Latest 是上游最新发布，两者需要区分。

| 工具组 | 更新时核对 |
| --- | --- |
| React、react-dom、类型声明 | 版本互相兼容，满足 Remotion 和 R3F 要求 |
| p5、p5.brush | 粒子 p5 与笔刷 standalone 的 API、共享状态及资源生命周期；复测延迟初始化、首帧、换图、重挂和热更新 |
| Three.js、R3F、@types/three | API、类型、渲染器及 Remotion 集成 |
| GSAP、@gsap/react、@remotion/gsap | React 生命周期和视频帧驱动 |
| Tweakpane、@tweakpane/core | 面板版本及其类型依赖 |
| Vite、React 插件 | Vite 主版本、Node 要求和插件 peerDependencies |
| TypeScript、ESLint、Remotion lint 配置 | 解析器实际支持的版本范围，避免每项分别选 Latest 后互不兼容 |

### Playwright 与浏览器

```bash
npm install -D --save-exact playwright@<目标版本>
PLAYWRIGHT_SKIP_BROWSER_GC=1 npx playwright install chromium
```

更新后安装对应版本浏览器，不手动替换 Remotion 的浏览器缓存。

### Node、npm、FFmpeg

Node 沿用原安装渠道升级兼容的 24.x，重新打开终端核对 `node --version` 与 `npm --version`。npm 通常随 Node 更新；单独升级时先检查目标 npm 的 Node 要求，再运行 `npm install -g npm@<目标版本>`。

本机 FFmpeg 由 Scoop 管理：

```bash
scoop update
scoop update ffmpeg
ffmpeg -version
ffprobe -version
```

其他安装渠道继续通过其原渠道更新。系统 FFmpeg 与 Remotion 自带的媒体处理组件分别维护。

## 安装、恢复和更新 skill

本项目的 5 个 skill 是直接复制的原文，当前没有 skills CLI 的安装记录。`upstream-lock.json` 是自定义的文件哈希清单，**不等同于** CLI 的 `skills-lock.json`；不能假定 `npx skills update` 会追踪这些副本。

### 恢复当前固定版本

迁移时直接复制 `.agents/skills/`。远端技能文件缺失时可运行：

```bash
python .agents/skills/sync-upstream.py
```

它只补齐脚本中固定提交的缺失文件，不覆盖已有文件、不升级、不校验或修复已有内容，也不刷新已存在的哈希清单。

`writing-for-agents` 单独复制本地来源；先检查目标有无本地修改，再决定覆盖：

```bash
mkdir -p .agents/skills/writing-for-agents
cp /c/project/openchamber/.agents/skills/writing-for-agents/SKILL.md .agents/skills/writing-for-agents/SKILL.md
```

其他机器没有 OpenChamber 源码时，复制本工作室已有副本即可。

### 更新手动副本

1. 从 [.agents/SOURCES.md](../.agents/SOURCES.md) 指向的原仓库查看变化并选定提交，确认指导适用于本项目工具版本。
2. 下载该提交 ZIP，在临时目录展开。复制 Remotion 的完整 `skills/remotion-best-practices/`；GSAP 只复制 `gsap-core`、`gsap-timeline`、`gsap-react`，保留许可证与配套参考。
3. 比较后替换选定目录。上游删除或改名的文件需单独确认处理，避免新旧混杂；删除使用 trash。
4. 更新 `.agents/SOURCES.md` 的提交与版本、`sync-upstream.py` 的固定来源；依据新文件重新计算 `upstream-lock.json` 的路径和 SHA-256。旧哈希不能作为新版本已验证的证据。
5. 检查相对链接、技能数量和 OpenCode 发现结果。正文保持英文，项目约定保留在中文 `AGENTS.md`。

### 以后改用 skills CLI 时

这是管理方式切换，先与用户确认。以下命令是可选迁移方法，本次未执行：

```bash
npx skills add remotion-dev/skills --skill remotion-best-practices --agent opencode
npx skills add greensock/gsap-skills --skill gsap-core gsap-timeline gsap-react --agent opencode
```

检查实际生成的目录、链接与锁文件，只保留一个有效版本，避免 `.opencode/skills/` 与 `.agents/skills/` 同 ID 内容不同。CLI 管理成功后才能针对性更新：

```bash
npx skills update remotion-best-practices gsap-core gsap-timeline gsap-react --project
```

`writing-for-agents` 继续按实际本地来源维护；CLI 也不会自动修改 `.agents/SOURCES.md`。

## 更新后的验证与回退

每组更新按受影响范围检查，工具链整体更新至少执行：

```bash
npm ls --depth=0
npx remotion versions
npm run check
npm run build:web -- tool-check
npm run build:video
npx remotion compositions src/video/index.ts
```

通过 `npm run dev:web -- tool-check` 启动工具演示网页服务后，执行 `node scripts/check-tools.mjs` 复测交互。它会更新 `output/tool-check/web/` 下的记录和截图，需保留旧结果时先复制。已验证的内容与局限见 [工具实测说明](../src/projects/tool-check/README.md)。

验证视频导出使用新的版本名：

```bash
npm run render -- ToolCheck output/tool-check/video/upgrade-check.mp4 --concurrency=1
ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate,nb_frames -show_entries format=duration -of json output/tool-check/video/upgrade-check.mp4
```

预期为 960×540、30 fps、5 秒；若文件已存在，换一个版本名。视觉与交互还需结合预览和用户反馈确认，编译成功不能代替验收。

升级失败时恢复备份的源码、`package.json` 与锁文件，再运行 `npm ci`，并恢复匹配的技能及来源记录。重新运行对应浏览器安装命令，验证受影响功能。素材与历史成片独立保留。
