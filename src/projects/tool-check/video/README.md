# 视频工具链实测

`ToolCheck` 是 5 秒、960×540、30 fps（150 帧）的无音轨短片。浅纸色背景、青绿色环结与中文标题用于同时验证三维场景和 DOM 动画的实际视频导出。原有 `EnvironmentCheck` 保留。

## 实现

- `ToolCheck.tsx`：`@remotion/three` 的 `ThreeCanvas` 承载 React Three Fiber 几何体、材质与灯光。旋转、缩放及轨道位置由 `useCurrentFrame()` / `fps` 直接计算。
- `@remotion/gsap` 的 `useGsapTimeline()` 负责标题、标注、短线与编号的 DOM 动画；钩子持有暂停时间轴，按视频帧定位，自动清理。没有实时 `useFrame()`、定时器或随机数。
- 在 `src/video/Root.tsx` 注册。沿用已有 `angle` 渲染配置。
- 不依赖外部素材、网络字体或音频；使用 Windows 本地中文字体。不同操作系统的字体和 GPU 可能产生不同像素结果。

## 已执行验证

2026-10-08，在当前 Win11 环境通过：

```bash
npm run typecheck
npx eslint src/projects/tool-check/video/ToolCheck.tsx src/video/Root.tsx
npm run render -- ToolCheck output/tool-check/video/tool-check.mp4 --concurrency=1
ffprobe -v error -count_frames -show_entries stream=index,codec_name,codec_type,width,height,r_frame_rate,avg_frame_rate,pix_fmt,nb_frames,nb_read_frames,duration:format=duration,size -of json output/tool-check/video/tool-check.mp4
ffmpeg -v error -i output/tool-check/video/tool-check.mp4 -f null -
npm run still -- ToolCheck output/tool-check/video/frame-020-a.png --frame=20
npm run still -- ToolCheck output/tool-check/video/frame-075-a.png --frame=75
npm run still -- ToolCheck output/tool-check/video/frame-020-b.png --frame=20
npm run still -- ToolCheck output/tool-check/video/frame-075-b.png --frame=75
sha256sum output/tool-check/video/frame-020-a.png output/tool-check/video/frame-020-b.png output/tool-check/video/frame-075-a.png output/tool-check/video/frame-075-b.png
```

另通过 ESLint Node API 将 `makeConfig({remotionDir: "src/projects/tool-check/video/**/*.{ts,tsx}"})` 作为本次命令覆盖配置，检查了作品文件的 Remotion 专用规则。全局配置未修改；常驻 lint 路径需由主代理统筹扩展。

实际 MP4：H.264、960×540、30/1 fps、5.000 秒、150 帧、563829 字节、`yuvj420p`，仅一条视频流。FFmpeg 完整解码无错误。

两次独立导出的同帧 PNG 字节一致：

| 帧（从 0 开始） | SHA-256（a、b 相同） |
| --- | --- |
| 20，文字入场中 | `c60a74f8ca1bc0a9fed1c64e581cd30cf7d982a55b8e117dddc0cd614907ed94` |
| 75，完整构图 | `eb9c69578f70e630ed28ea7ebbe9e73a92fb15246193b29f6600d48b8139bc26` |

上述重复静帧证明当前环境下这两个采样点可重复；没有进行跨机器像素一致性验证。用户可播放 `output/tool-check/video/tool-check.mp4` 检查文字分层入场、三维连续旋转、底部进度和整体节奏。视觉审美仍待用户验收。

## 已知提示

视频渲染出现 `THREE.Clock: This module has been deprecated. Please use THREE.Timer instead.`。查到 R3F 9.8.1 在 `node_modules/@react-three/fiber/dist/events-9ce18a08.esm.js:1054` 创建 `new THREE.Clock()`；作品自身没有创建 Clock。未修改依赖，提示不影响本次导出、完整解码和重复静帧检测。

## 核对资料与版本

- Remotion、`@remotion/three`、`@remotion/gsap`：4.0.534；R3F：9.8.1；Three.js：0.186.1；GSAP：3.15.0。
- 官方 [ThreeCanvas](https://www.remotion.dev/docs/three-canvas)、[Three 集成与渲染配置](https://www.remotion.dev/docs/three)。
- 官方 [useGsapTimeline](https://www.remotion.dev/docs/gsap/use-gsap-timeline)：只接受 DOM/SVG 元素、同步 builder；禁止播放、回调、无种子随机值和独立动画。
- [R3F Canvas](https://r3f.docs.pmnd.rs/api/canvas)、[Three r186 TorusKnotGeometry 源码及参数注释](https://github.com/mrdoob/three.js/blob/r186/src/geometries/TorusKnotGeometry.js)。
- 已读本地 Remotion 创建、markup、3D、composition、render 与视频布局参考，以及 GSAP core、React、timeline 技能。
