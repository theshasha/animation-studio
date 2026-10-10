# 工具链演示

用于验证交互网页与视频工具能否实际协同工作，包含粒子、水彩、三维、时间轴和已导出的短片。

## 查看

```bash
npm run dev:web -- tool-check
npm run dev:video
```

- 网页：`http://127.0.0.1:5173`。
- 视频时间轴：`http://localhost:3000/ToolCheck`，需要单独启动视频服务。
- 成片：`output/tool-check/video/tool-check.mp4`；网页播放副本在 `public/projects/tool-check/tool-check.mp4`。

## 当前验证状态

2026-10-10，p5.brush 独立版迁移的自动检查与浏览器实测通过，用户也已确认自己的浏览器复测正常。

| 演示 | 已验证内容 |
| --- | --- |
| p5.js 粒子 | 连续绘制、鼠标避让、初始化与卸载 |
| p5.brush 水彩 | 水彩与铅笔首帧合成、换种子、还原、多次刷新与重挂、热更新 |
| Three.js / Tweakpane | 自动旋转、拖拽相机、调整速度与材质颜色 |
| GSAP / React | 时间轴暂停、定位和继续 |
| 网页布局与媒体 | 桌面与 390px 布局、MP4 播放和定位；自动浏览器无 JS 异常或 console.error |
| Remotion 视频 | H.264、960×540、30 fps、5 秒、150 帧；完整解码及两个采样帧的重复导出通过，详见 [视频说明](video/README.md) |

针对初始化顺序，测试会阻塞笔刷模块，确认粒子先独立运行，放行后水彩正常；同时覆盖加载中卸载、旧循环停止、独占 WebGL 上下文释放及动画帧暂停时水彩仍可完成绘制。

## 关键实现约束

- 粒子使用 p5 实例；水彩通过 `web/brush-runtime.ts` 使用 `p5.brush/standalone`，避开默认插件影响普通 2D sketch 的全局生命周期钩子，问题背景见 [上游 #52](https://github.com/acamposuribe/p5.brush/issues/52)。本地迁移不代表上游插件已修复。
- 水彩保留 8 个色块、48 根 2B 铅笔线和原配色。几何参数沿用 p5 的 LCG 随机序列，笔触纹理由独立版种子控制；绘制后显式调用 `render()` 合成最后一层。
- 独立版共享一个活动目标，本演示同时只挂载一个水彩组件。`scaleBrushes()` 是累积缩放，初始化与热更新必须避免重复放大。
- p5.brush 2.2.3 没有公开完整销毁接口。组件卸载时释放独占 WebGL 上下文；库的 JS 缓存仍存在，扩展不可用时不能保证即时释放 GPU 资源。
- 同种子重绘和迁移前后对照只测到极少量像素差异，不保证字节级一致。像素测量与截图保存在检查产物中。

## 重跑检查

启动本作品网页服务后，在项目根目录执行：

```bash
npm run check
npm run build:web -- tool-check
node scripts/check-tools.mjs
```

浏览器脚本针对开发服务运行，并会触碰 `web/brush-runtime.ts` 的时间戳来验证真实 HMR，文件内容保持不变。

结果写入 `output/tool-check/standalone/`：

- `checks.json`：通过项、像素测量、局限和错误。
- `desktop.png`、`mobile.png` 及局部截图：布局与绘制结果。
- `before-brush.png`、`migration-comparison.json`：迁移时保存的基线与对照结果，不由日常检查重新生成。
- `browser-panel-verified.jpg`：迁移验收时的浏览器面板截图。

重跑会更新同名检查结果和自动截图；需要对照时先保留旧产物。`output/` 不随仓库提交，迁移基线、面板截图及 `output/tool-check/web/` 中的历史检查仅保存在原工作目录。

## 尚未覆盖

音频混音、音画同步及水彩动画的视频导出尚未实测；跨设备像素一致性没有验证。视频渲染中的 R3F 弃用提示见视频说明。
