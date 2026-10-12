# 动画工作室

用于创作动画视频、生成艺术和交互网页。各作品共用一套 npm 依赖，作品源码与说明放在 `src/projects/<作品名>/`。

工具包括 React / Vite、Remotion、p5.js、Three.js / React Three Fiber、GSAP、Tweakpane，以及 Playwright。依赖版本见 `package.json` 和锁文件；环境使用 Node.js 24 与本机 FFmpeg / ffprobe。

- [项目协作与目录约定](AGENTS.md)
- [设计资源与使用方法](docs/design-resources.md)
- [安装、恢复和更新](docs/setup-and-updates.md)
- [工具演示与验证状态](src/projects/tool-check/README.md)
- [技能来源](.agents/SOURCES.md)

## 启动预览

在项目根目录运行：

```bash
npm run dev:web -- tool-check
npm run dev:video
```

- 网页：`http://127.0.0.1:5173`，通过作品目录名选择页面。切换作品时停止对应服务，再传入新的作品名启动。
- Remotion Studio：默认端口 `3000`，以终端输出为准。`EnvironmentCheck` 用于基础检查，`ToolCheck` 为工具演示短片。

两个服务可以独立运行。网页命令缺少作品名或名称错误时，会列出可用作品。

## 新增作品

### 交互网页

在 `src/projects/<作品名>/web/App.tsx` 中具名导出无需属性的 React 组件 `App`。作品名使用文字、数字、下划线或短横线。

随后用作品名启动或构建，无需修改公共网页入口。所有作品源码仍参与全项目类型检查。

### 视频

将作品组件放在对应作品目录，在 `src/video/Root.tsx` 注册 Composition，并把视频源码路径加入 `eslint.config.mjs` 的 Remotion 专用规则范围。视频帧规则仅应用于视频源码。

## 检查与构建

| 命令 | 输出或用途 |
| --- | --- |
| `npm run check` | JavaScript 语法、TypeScript 与 ESLint 检查 |
| `npm run build:web -- <作品名>` | 指定网页作品，输出到 `output/web/` |
| `npm run preview:web` | 预览最近一次网页构建 |
| `npm run build:video` | Remotion 渲染包，输出到 `output/bundle/` |

`npm run check:syntax` 可单独检查根目录直属及 `scripts/`、`src/` 下的 `.js`、`.mjs`、`.cjs` 文件，递归扫描时跳过依赖和生成目录。浏览器回归方法见 [tool-check](src/projects/tool-check/README.md#重跑检查)。

## 导出

指定作品 ID 和输出路径。例如导出环境检查静帧：

```bash
npm run still -- EnvironmentCheck output/environment-check/frame.png --frame=30
```

导出视频：

```bash
npm run render -- <作品ID> output/<作品名>/<版本>.mp4
```

覆盖已有输出默认关闭。视频导出和复测示例见 [视频说明](src/projects/tool-check/video/README.md#导出与复测)。

## 开源与仓库内容

项目自有代码与文档采用 [MIT 许可证](LICENSE)。第三方依赖及 `.agents/skills/` 中的技能保留各自的许可与来源，不因本项目采用 MIT 而改变；技能来源见 [.agents/SOURCES.md](.agents/SOURCES.md)。

视频仅提交网页演示所需的 `public/projects/tool-check/tool-check.mp4`；其他视频、`output/`、依赖目录及本地会话产物不纳入版本管理。成片、静帧和检查记录按作品说明在本地生成；历史对照产物仅保存在原工作目录。
