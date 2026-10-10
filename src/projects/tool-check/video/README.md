# 视频工具链演示

`ToolCheck` 是 5 秒、960×540、30 fps（150 帧）的无音轨短片。浅纸色背景、青绿色环结与中文标题用于验证三维场景和 DOM 动画的视频导出。

## 实现

- `ToolCheck.tsx` 使用 `@remotion/three` 的 `ThreeCanvas` 承载 React Three Fiber 场景，三维运动由 `useCurrentFrame()` 与 fps 计算。
- `@remotion/gsap` 的 `useGsapTimeline()` 驱动标题、标注和图形的 DOM 动画，按视频帧定位。
- 作品在 `src/video/Root.tsx` 注册，采用项目已有的 ANGLE 渲染配置；视频目录已纳入 `eslint.config.mjs` 的 Remotion 专用规则。
- 使用 Windows 本地中文字体，无外部素材、网络字体或音频依赖。

## 验证结果

2026-10-08 在当前 Win11 环境完成实际导出：H.264、960×540、30 fps、5 秒、150 帧，仅视频流；FFmpeg 完整解码通过。第 20、75 帧分别独立导出两次，PNG 字节一致。

成片与采样帧位于 `output/tool-check/video/`。网页内 MP4 播放与定位也已通过检查，见 [网页演示说明](../README.md)。视频审美验收尚未记录，不将网页浏览器复测视为视频审美验收。

两个采样点的重复结果只适用于当前环境；字体和 GPU 差异可能影响其他设备的像素结果。

## 导出与复测

在项目根目录执行，输出使用新的版本名：

```bash
npm run check
npm run render -- ToolCheck output/tool-check/video/verify-v1.mp4 --concurrency=1
ffprobe -v error -count_frames -show_entries stream=codec_name,width,height,r_frame_rate,nb_frames,nb_read_frames:format=duration -of json output/tool-check/video/verify-v1.mp4
ffmpeg -v error -i output/tool-check/video/verify-v1.mp4 -f null -
```

预期为 H.264、960×540、30 fps、5 秒、150 帧，完整解码无错误。文件已存在时换一个版本名。

重复帧检查示例：

```bash
npm run still -- ToolCheck output/tool-check/video/verify-v1-075-a.png --frame=75
npm run still -- ToolCheck output/tool-check/video/verify-v1-075-b.png --frame=75
sha256sum output/tool-check/video/verify-v1-075-a.png output/tool-check/video/verify-v1-075-b.png
```

将帧号改为 20 可复测文字入场阶段。播放成片时关注文字分层入场、三维连续旋转、底部进度与整体节奏。

## 已知提示与参考

渲染会出现 `THREE.Clock` 弃用提示，来自当前 R3F 内部；已验证不影响本次导出、解码和重复静帧检测。

- [Remotion ThreeCanvas](https://www.remotion.dev/docs/three-canvas)
- [Three.js 集成与渲染配置](https://www.remotion.dev/docs/three)
- [useGsapTimeline](https://www.remotion.dev/docs/gsap/use-gsap-timeline)

当前依赖版本以项目 `package.json` 和锁文件为准。
