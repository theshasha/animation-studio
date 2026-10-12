# 工具链演示

用于验证交互网页与视频工具能否实际协同工作，包含粒子、三维、时间轴和已导出的短片。桌面端粒子与三维并排，时间轴占满下一行；移动端按顺序单列排列。

## 查看

```bash
npm run dev:web -- tool-check
npm run dev:video
```

- 网页：`http://127.0.0.1:5173`。
- 视频时间轴：`http://localhost:3000/ToolCheck`，需要单独启动视频服务。
- 成片：`output/tool-check/video/tool-check.mp4`；网页播放副本在 `public/projects/tool-check/tool-check.mp4`。

## 当前验证状态

2026-10-11，用户已确认当前网页预览正常。依赖检查、TypeScript、ESLint、网页构建和检查脚本语法检查通过；调整后的浏览器回归脚本尚未重跑。构建仍提示主包超过 500 kB。

## 演示内容

| 演示 | 功能 |
| --- | --- |
| p5.js 粒子 | 连续绘制、鼠标避让 |
| Three.js / Tweakpane | 自动旋转、拖拽相机、调整速度与材质颜色 |
| GSAP / React | 时间轴暂停、定位和继续 |
| Remotion 视频 | 网页播放与定位；规格及导出验证见 [视频说明](video/README.md) |

## 重跑检查

启动本作品网页服务后，在项目根目录执行：

```bash
npm run check
npm run build:web -- tool-check
node scripts/check-tools.mjs
```

浏览器脚本覆盖上述交互、390px 布局、连续刷新、卸载重挂、p5 异步初始化期间卸载，以及 JS 异常与 console.error。

检查结果写入 `output/tool-check/web/<运行编号>/`，实际路径打印到终端：

- `checks.json`：整体结果 `status`、完成或失败阶段 `stage`、通过项、粒子像素测量、网页错误及脚本失败原因 `failures`。
- `desktop.png`、`mobile.png` 及局部截图：布局与绘制结果。

检查记录以各次运行的 `checks.json` 为准。启动、检查、关闭浏览器或保存报告失败均返回非零退出码；报告无法写入时，从终端查看失败原因。

## 尚未覆盖

音频混音、音画同步尚未实测；跨设备像素一致性没有验证。视频渲染中的 R3F 弃用提示见视频说明。
