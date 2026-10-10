# 工具链实测

这是环境验收演示，包含可操作网页和真正导出的短片。没有使用或生成音效、BGM，`public/assets/` 仍为空。

## 查看

- 启动 `npm run dev:web -- tool-check`，访问 `http://127.0.0.1:5173`。
- 启动 `npm run dev:video`，访问 `http://localhost:3000/ToolCheck`。
- MP4：`output/tool-check/video/tool-check.mp4`。为网页播放复制了一份到 `public/projects/tool-check/tool-check.mp4`。

## 已实际验证

| 工具 | 检查结果 |
| --- | --- |
| p5.js | Canvas 2D 粒子绘制、连续动画、鼠标输入正常 |
| p5.brush | 2.2.3 standalone、WebGL2、水彩填充、铅笔首帧、切换与还原种子正常；不再注册 p5 插件 |
| Three.js | 几何体、材质、灯光、自动旋转、OrbitControls 拖动相机正常 |
| Tweakpane | 速度设为零后旋转停止、颜色修改生效；补齐官方 `@tweakpane/core` 类型依赖 |
| GSAP / React | 时间轴动画、暂停、继续、定位进度与组件作用域正常 |
| Remotion / R3F / GSAP | 实际输出 H.264、960×540、30 fps、150 帧、5 秒视频；重复静帧哈希一致 |
| Playwright | 自动操作网页，检查交互结果，桌面及 390px 布局截图；没有 JS 异常或 console.error |
| FFmpeg / ffprobe | 验证编码、帧数、时长，完整解码通过；网页内 MP4 播放与定位正常 |

## 独立版迁移与验证（2026-10-10）

水彩通过 `web/brush-runtime.ts` 加载 `p5.brush/standalone`，使用独立画布、变换、种子和显式 `render()`；保留 8 个水彩色块、48 根 2B 铅笔线及原配色。几何参数沿用 p5 2.3.4 的 LCG 随机序列，纹理由独立版自己的 seed/noiseSeed 控制。粒子继续使用 p5，水彩模块异步加载不会阻塞它。

`scaleBrushes(3)` 只初始化一次，热更新通过 `import.meta.hot.data` 保留标记，避免重复放大。绘制完成才公布就绪；静态绘制使用可取消定时任务，避免隐藏面板暂停 RAF 后按钮一直禁用。加载中卸载会取消旧任务；p5 的异步初始化恢复时也会检查取消状态。每次水彩重挂创建新目标，先初始化合成资源，再清画布；卸载主动调用独占上下文的 `WEBGL_lose_context`，不只移除 DOM。

已通过：

- `npm run check`、`npm run build:web -- tool-check`、`node --check scripts/check-tools.mjs`；构建仍有大 chunk 提示。
- `node scripts/check-tools.mjs`：正常首帧、末根铅笔线局部像素、连续换种子及还原、3 次刷新、3 次卸载/重挂；没有重复画布，旧实例停止更新，旧笔刷上下文确认丢失。
- 网络层阻塞笔刷模块时，粒子先持续绘制；放行后原页面水彩正常。另测笔刷加载中卸载重挂、粒子 presetup 延迟期间卸载，均无遗留画布或循环。测试延迟只存在于检查脚本。
- 固定动画时间后移动指针，粒子实际变化 3,027 个像素，验证鼠标避让而非只检查鼠标坐标。
- 真实 Vite 模块热更新（只触碰文件时间戳）：确认未整页刷新，重建画布后同种子恢复，笔刷尺寸没有累积。另模拟 RAF 暂停，水彩首帧与换图仍可完成。
- Three.js 拖拽、Tweakpane 速度/颜色、GSAP 暂停/定位/继续、现有 MP4 播放/定位和 390px 布局通过；自动浏览器无 JS 异常或 console.error。未重新导出视频。
- OpenChamber 浏览器面板实际操作换种子、还原，标签正确变为 25、24，按钮恢复可用；保存了面板截图。桌面、移动及局部画面截图同时保留在检查目录。

最新自动检查产物为 `output/tool-check/standalone/`，历史 `output/tool-check/web/` 不覆盖。`checks.json` 中记录像素测量：换种子改变 85,659/230,400 个像素；还原仅 5 个像素不同，最大单通道差 4/255；连续操作后还原差 8 个像素，热更新后差 17 个像素。微小差异会随运行变化，不保证字节级一致。

迁移前后的 628×355 显示尺寸截图对照，只有 6 个像素、最大单通道 1/255 的差异（`migration-comparison.json`）。这支持本次种子 24 的画面保持，但不是所有种子、设备或原始分辨率逐像素等价的证明。

## 历史问题与剩余局限

- 2026-10-10：用户反馈“流动的星群”空白，其他演示正常。初次本地连续 6 次加载及交互检查均通过，但用户提供的报错指向 p5.brush 的 `postsetup`。随后仅在测试浏览器中将水彩 WebGL 初始化延迟 300 毫秒，复现相同异常、粒子未绘制而水彩正常；进一步只加载 p5 2.3.4 与 p5.brush 2.2.3 并创建普通 2D sketch，也复现异常且 `draw()` 执行次数为 0。原因是插件全局生命周期钩子对普通 2D 实例也执行需要 WebGL 的合成初始化。部分扩展会影响触发概率，但不是复现前提。已获用户授权，以英文提交上游 [p5.brush #52](https://github.com/acamposuribe/p5.brush/issues/52)。当前已通过独立版绕开该钩子，并通过初始化顺序回归；没有关闭或宣称修复上游 issue。用户本人 Chrome 扩展配置仍待本人复核。

历史上为修复首帧缺少铅笔层，曾暴露全局 p5 后加载插件，通过 `postdraw` 完成合成。此接入已被独立版显式 `render()` 替代，当前不再设置 `window.p5` 或加载默认入口。

- 插件初始化修复后，同种子重绘的哈希仍不同，但进一步直接比较 640×360 原始像素，只发现 230,400 个像素中有 6 个不同（0.0026%），最大单通道差值 10/255，所有 RGB 通道的平均绝对差为 0.000078125/255。本次结果见 `output/tool-check/web/brush-pixel-diff.json`；用户肉眼未见差异。此前仅凭哈希不同认定无法用于精确视频导出的说法过重，现撤回。字节级一致和视觉一致应分开评价；笔刷动画的完整导出仍需实际制作验证。
- 独立版仍是单一活动目标的模块共享状态，本演示仅同时挂载一个水彩组件。2.2.3 没有公开完整 dispose；上下文丢失释放 GPU 资源不代表清空库的 JS 缓存。扩展不可用的浏览器不能保证即时释放；本次 Chromium 已验证可用。
- 没有用户选定的音频素材，因此 `@remotion/media` 音频混音、音画同步尚未验证；也未覆盖所有编解码器或所有绘图库 API。
- R3F 内部有 `THREE.Clock` 弃用提示，当前视频导出正常。

## 重跑

通过 `npm run dev:web -- tool-check` 启动本作品的网页服务后，执行 `node scripts/check-tools.mjs`。结果写入 `output/tool-check/standalone/checks.json`，截图位于同目录。脚本会更新时间戳触发一次真实 HMR，不修改源码内容；会单独记录同种子像素误差，不把哈希不同直接认定为视觉失败。

视频实现及重复帧验证的完整记录见 [video/README.md](video/README.md)。
