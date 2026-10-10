import * as brush from "p5.brush/standalone";

// scaleBrushes 是乘法；React 重挂和本模块热更新都不能重复放大。
if (!import.meta.hot?.data.brushScaled) brush.scaleBrushes(3);
if (import.meta.hot) import.meta.hot.data.brushScaled = true;

// 延续 p5 2.3.4 的几何随机序列，不为 random() 单独创建 sketch。
// 笔触纹理使用独立版自己的 seed/noiseSeed，不承诺与旧引擎逐像素一致。
const geometryRandom = (seed: number) => {
  let state = seed >>> 0;
  return (min: number, max: number) => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return min + state / 4294967296 * (max - min);
  };
};

export const createBrushSurface = (parent: HTMLElement) => {
  // WebGL2 初始化成功后才接入 DOM，失败时不留下空画布。
  const canvas = brush.createCanvas(640, 360, { parent: null, pixelDensity: 1 });
  const gl = canvas.getContext("webgl2");
  let disposed = false;
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    // 2.2.3 没有公开 dispose；主动释放独占上下文，库的 JS 单例仍保留。
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    canvas.remove();
  };
  try {
    brush.angleMode(brush.RADIANS);
    // 先让新 renderer 接管共享合成资源，再 clear，避免重挂时引用旧 framebuffer。
    brush.render();
    parent.appendChild(canvas);
  } catch (error) {
    dispose();
    throw error;
  }
  return {
    draw(seed: number) {
      if (disposed) return;
      const random = geometryRandom(seed);
      // 此演示只有一个活动水彩目标；同一目标重绘不重复 load、分配 renderer。
      brush.seed(seed); brush.noiseSeed(seed);
      brush.clear("#f1eadb");
      brush.push();
      try {
        brush.translate(-320, -180);
        brush.noField(); brush.noWash(); brush.noHatch(); brush.noStroke();
        brush.fillBleed(0.15); brush.fillTexture(0.25, 0.3);
        const colors = ["#cf744f", "#417f79", "#c6a253"];
        for (let i = 0; i < 8; i++) {
          brush.fill(colors[i % 3], 80);
          brush.circle(90 + i * 65, 120 + random(-35, 85), random(32, 60));
        }
        brush.noFill();
        brush.set("2B", "#354b48", 0.35);
        for (let i = 0; i < 48; i++) {
          const x = 55 + i * 11;
          brush.line(x, 307, x + random(-35, 35), 180 + random(-60, 60));
        }
      } finally {
        brush.pop();
      }
      brush.render();
    },
    dispose,
  };
};
