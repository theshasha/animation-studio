import { chromium } from "playwright";
import { mkdir, writeFile, utimes } from "node:fs/promises";
import { createHash } from "node:crypto";
import assert from "node:assert/strict";

const output = "output/tool-check/standalone";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, deviceScaleFactor: 1 });
const errors = [];
const checks = [];
const limitations = [];
const measurements = {};
const brushModules = new Set();
page.on("request", request => { if (/p5[._-]+brush/.test(request.url())) brushModules.add(request.url()); });
page.on("pageerror", e => errors.push(e.message));
page.on("console", msg => { if (msg.type() === "error") errors.push(msg.text()); });
const hash = bytes => createHash("sha256").update(bytes).digest("hex");
const pixels = locator => locator.evaluate(canvas => {
  const copy = document.createElement("canvas");
  copy.width = canvas.width; copy.height = canvas.height;
  const ctx = copy.getContext("2d");
  ctx.drawImage(canvas, 0, 0);
  return Array.from(ctx.getImageData(0, 0, copy.width, copy.height).data);
});
const difference = (a, b) => {
  assert.equal(a.length, b.length);
  let changed = 0, max = 0, total = 0;
  for (let i = 0; i < a.length; i += 4) {
    let different = false;
    for (let c = 0; c < 3; c++) {
      const delta = Math.abs(a[i + c] - b[i + c]);
      different ||= delta > 0; max = Math.max(max, delta); total += delta;
    }
    if (different) changed++;
  }
  return { changedPixels: changed, pixelCount: a.length / 4, maxChannelDelta: max, meanAbsoluteRGB: total / (a.length / 4 * 3) };
};
const ready = async () => {
  for (const id of ["particles", "brush", "three"]) {
    await page.waitForSelector(`[data-testid="${id}"][data-ready="true"]`, { timeout: 60000 });
    assert.equal(await page.getByTestId(id).locator("canvas").count(), 1);
  }
};
const paintMetrics = async () => {
  const data = await pixels(page.getByTestId("brush").locator("canvas"));
  let pencil = 0, watercolor = 0;
  for (let y = 0; y < 360; y++) for (let x = 0; x < 640; x++) {
    const i = (y * 640 + x) * 4, [r, g, b, a] = data.slice(i, i + 4);
    if (y >= 250 && y < 315 && r < 150 && g < 150 && b < 150 && a === 255) pencil++;
    if (y >= 40 && y < 230 && Math.abs(r - 241) + Math.abs(g - 234) + Math.abs(b - 219) > 35 && a === 255) watercolor++;
  }
  assert.ok(pencil > 100, `铅笔层缺失：${pencil}`);
  assert.ok(watercolor > 4000, `水彩层缺失：${watercolor}`);
  return { pencil, watercolor };
};
try {
  await page.goto("http://127.0.0.1:5173");
  for (const id of ["particles", "brush", "three"]) {
    await page.waitForSelector(`[data-testid="${id}"][data-ready="true"]`, { timeout: 60000 });
    const canvas = page.locator(`[data-testid="${id}"] canvas`);
    assert.equal(await canvas.count(), 1);
    await canvas.screenshot({ path: `${output}/${id}.png` });
    checks.push(`${id}：画布初始化并截图`);
  }
  const particles = page.getByTestId("particles");
  await particles.hover({ position: { x: 110, y: 90 } });
  await page.waitForFunction(() => document.querySelector('[data-testid="particles"]').dataset.pointer !== "0,0");
  checks.push(`p5 鼠标坐标：${await particles.getAttribute("data-pointer")}`);

  const brush = page.getByTestId("brush");
  const pencilPixels = () => brush.locator("canvas").evaluate(canvas => {
    const copy = document.createElement("canvas");
    copy.width = canvas.width; copy.height = canvas.height;
    const ctx = copy.getContext("2d");
    ctx.drawImage(canvas, 0, 0);
    const pixels = ctx.getImageData(0, 250, 640, 65).data;
    let dark = 0;
    for (let i = 0; i < pixels.length; i += 4) if (pixels[i] < 150 && pixels[i + 1] < 150 && pixels[i + 2] < 150) dark++;
    return dark;
  });
  assert.ok(await pencilPixels() > 100, "首次绘制必须完成铅笔层合成");
  const brushPixels = () => brush.locator("canvas").evaluate(el => el.toDataURL());
  await brush.locator("canvas").screenshot({ path: `${output}/brush-initial.png` });
  const initial = hash(await brushPixels());
  const initialPixels = await pixels(brush.locator("canvas"));
  measurements.initial = await paintMetrics();
  const lastPencil = initialPixels.filter((value, i) => {
    const pixel = Math.floor(i / 4), x = pixel % 640, y = Math.floor(pixel / 640);
    return i % 4 === 0 && x >= 568 && x <= 577 && y >= 298 && y <= 311 && value < 150 && initialPixels[i + 1] < 150 && initialPixels[i + 2] < 150;
  }).length;
  assert.ok(lastPencil > 0, `首帧最右侧末根铅笔线起笔处缺失：${lastPencil}`);
  measurements.lastPencilPixels = lastPencil;
  await page.getByRole("button", { name: "换一张笔触" }).click();
  await page.waitForFunction(() => document.querySelector('[data-testid="brush"]').dataset.seed === "25");
  const changed = hash(await brushPixels());
  measurements.changed = difference(initialPixels, await pixels(brush.locator("canvas")));
  assert.ok(measurements.changed.changedPixels > 10000, "换种子应明显改变实际画面");
  assert.ok(await pencilPixels() > 100, "换图后铅笔层必须保持可见");
  assert.notEqual(initial, changed, "更换种子后笔刷画面应变化");
  await page.getByRole("button", { name: "还原种子" }).click();
  await page.waitForFunction(() => document.querySelector('[data-testid="brush"]').dataset.seed === "24");
  await brush.locator("canvas").screenshot({ path: `${output}/brush-restored.png` });
  const restored = hash(await brushPixels());
  measurements.restored = difference(initialPixels, await pixels(brush.locator("canvas")));
  assert.ok(measurements.restored.meanAbsoluteRGB < 0.1 && measurements.restored.changedPixels < 2304, "还原图案存在超出微小像素误差的差异");
  if (initial !== restored) limitations.push("同种子重绘有微小像素差异，具体见 measurements.restored；不以 PNG 哈希判断视觉一致性");
  for (let i = 0; i < 4; i++) {
    await page.getByRole("button", { name: "换一张笔触" }).click();
    await page.waitForFunction(seed => document.querySelector('[data-testid="brush"]').dataset.seed === String(seed), 25 + i);
    await paintMetrics();
  }
  await page.getByRole("button", { name: "还原种子" }).click();
  await page.waitForFunction(() => document.querySelector('[data-testid="brush"]').dataset.seed === "24");
  measurements.repeatedRestore = difference(initialPixels, await pixels(brush.locator("canvas")));
  assert.ok(measurements.repeatedRestore.meanAbsoluteRGB < 0.1);
  checks.push("p5.brush：水彩、铅笔与种子切换可用");
  checks.push("p5.brush：首帧与换图均有完整铅笔层，末尾笔触不会延迟到下一次点击");

  const three = page.getByTestId("three");
  await three.scrollIntoViewIfNeeded();
  const box = await three.boundingBox();
  const beforeCamera = await three.getAttribute("data-camera");
  await page.mouse.move(box.x + 140, box.y + 100); await page.mouse.down();
  await page.mouse.move(box.x + 240, box.y + 150, { steps: 10 }); await page.mouse.up();
  assert.notEqual(await three.getAttribute("data-camera"), beforeCamera);
  checks.push("Three.js：鼠标拖动改变相机位置");
  const inputs = page.getByTestId("tweakpane").locator('input[type="text"]');
  await inputs.nth(0).fill("0"); await inputs.nth(0).press("Enter");
  const rotation = await three.getAttribute("data-rotation");
  await page.waitForTimeout(250);
  assert.equal(await three.getAttribute("data-rotation"), rotation);
  await inputs.nth(1).fill("#c97653"); await inputs.nth(1).press("Enter");
  await page.waitForFunction(() => document.querySelector('[data-testid="three"]').dataset.color === "#c97653");
  await three.screenshot({ path: `${output}/three-adjusted.png` });
  checks.push("Tweakpane：旋转速度设为 0 后保持静止，颜色绑定生效");

  await page.getByRole("button", { name: "暂停时间轴" }).click();
  const orb = page.locator(".orb").first();
  const paused = await orb.evaluate(el => getComputedStyle(el).transform);
  await page.waitForTimeout(250);
  assert.equal(await orb.evaluate(el => getComputedStyle(el).transform), paused);
  const slider = page.getByRole("slider", { name: "时间轴进度" });
  await slider.fill("0.75");
  const sought = await orb.evaluate(el => getComputedStyle(el).transform);
  assert.notEqual(sought, paused);
  await page.getByRole("button", { name: "继续时间轴" }).click();
  await page.waitForFunction(previous => getComputedStyle(document.querySelector('.orb')).transform !== previous, sought);
  checks.push("GSAP：暂停保持变换，定位进度改变画面，继续恢复播放");

  const video = page.locator("video");
  await video.scrollIntoViewIfNeeded();
  const metadata = await video.evaluate(async el => {
    await el.play();
    return { width: el.videoWidth, height: el.videoHeight, duration: el.duration };
  });
  assert.deepEqual(metadata, { width: 960, height: 540, duration: 5 });
  await page.waitForFunction(() => document.querySelector('video').currentTime > 0.3);
  await video.evaluate(el => { el.pause(); el.currentTime = 2.5; });
  await page.waitForFunction(() => document.querySelector('video').readyState >= 2);
  await video.screenshot({ path: `${output}/video-playback.png` });
  checks.push("导出 MP4：浏览器识别 960×540 / 5 秒，播放推进并可定位到 2.5 秒");
  await page.screenshot({ path: `${output}/desktop.png`, fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  await page.screenshot({ path: `${output}/mobile.png`, fullPage: true });
  checks.push("390px 移动布局：无横向溢出");
  await page.setViewportSize({ width: 1440, height: 1100 });
  for (let i = 0; i < 3; i++) {
    await page.reload(); await ready(); await paintMetrics();
    const canvas = page.getByTestId("particles").locator("canvas");
    const before = await pixels(canvas);
    await page.waitForTimeout(200);
    assert.ok(difference(before, await pixels(canvas)).changedPixels > 500, "刷新后粒子必须持续绘制");
  }
  checks.push("连续 3 次刷新：粒子持续绘制、水彩与铅笔首帧完整");

  // 只在测试网络层控制 React 根和笔刷模块，不把延迟或测试入口写入产品。
  await page.route("**/src/projects/tool-check/web/CanvasLab.tsx*", async route => {
    const response = await route.fetch();
    const source = await response.text();
    assert.match(source, /p\.millis\(\) \/ (1000|1e3)/);
    const probe = `\np5.registerAddon((ctor, proto, hooks) => { hooks.presetup = async function() { if (window.__holdParticle) { window.__pendingParticle = this; await new Promise(resolve => { window.__releaseParticle = resolve; }); } }; });\n`;
    await route.fulfill({ response, body: source.replace(/p\.millis\(\) \/ (1000|1e3)/, "window.__freezeParticles ? 0 : p.millis() / 1000").replace('p.background("#102831");', 'node.dataset.testFrames = String(Number(node.dataset.testFrames || 0) + 1); p.background("#102831");') + probe });
  });
  await page.route("**/src/web/main.tsx*", async route => {
    const response = await route.fetch();
    const source = await response.text();
    assert.ok(source.includes("createRoot(root).render("));
    await route.fulfill({ response, body: source.replace("createRoot(root).render(", "const testRoot = createRoot(root); window.__toolCheckRender = () => testRoot.render(") + "\nwindow.__toolCheckClear = () => testRoot.render(null); window.__toolCheckRender();" });
  });
  let releaseBrush;
  let brushGate = new Promise(resolve => { releaseBrush = resolve; });
  let delayed = false;
  await page.route("**/src/projects/tool-check/web/brush-runtime.ts*", async route => {
    delayed = true;
    await brushGate;
    await route.continue();
  });
  await page.goto("http://127.0.0.1:5173", { waitUntil: "domcontentloaded" });
  await page.waitForSelector('[data-testid="particles"][data-ready="true"]');
  assert.ok(delayed, "必须确实拦截笔刷模块");
  assert.equal(await brush.getAttribute("data-ready"), "false");
  assert.equal(await page.getByRole("button", { name: "换一张笔触" }).isDisabled(), true);
  const earlyParticles = await pixels(particles.locator("canvas"));
  await page.waitForTimeout(350);
  assert.ok(difference(earlyParticles, await pixels(particles.locator("canvas"))).changedPixels > 500);
  await particles.screenshot({ path: `${output}/particles-before-brush.png` });
  releaseBrush();
  await ready(); await paintMetrics();
  await brush.screenshot({ path: `${output}/brush-delayed.png` });
  checks.push("定向回归：笔刷模块延迟时粒子先连续绘制；释放加载后原页面两幅画布均正常");
  brushGate = new Promise(resolve => { releaseBrush = resolve; });
  delayed = false;
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForSelector('[data-testid="particles"][data-ready="true"]');
  assert.ok(delayed);
  // 模块仍在加载时卸载并重新挂载，旧异步任务不得留下画布。
  await page.evaluate(() => window.__toolCheckClear());
  await page.waitForSelector('[data-testid="brush"]', { state: "detached" });
  releaseBrush();
  await page.unroute("**/src/projects/tool-check/web/brush-runtime.ts*");
  await page.evaluate(() => window.__toolCheckRender());
  await ready(); await paintMetrics();
  checks.push("笔刷加载中卸载/重挂后两者正常，按钮状态正确");
  await page.evaluate(() => { window.__freezeParticles = true; });
  await page.mouse.move(0, 0);
  await page.waitForTimeout(100);
  const withoutPointer = await pixels(particles.locator("canvas"));
  await particles.hover({ position: { x: 320, y: 180 } });
  await page.waitForTimeout(100);
  measurements.pointerAvoidance = difference(withoutPointer, await pixels(particles.locator("canvas")));
  assert.ok(measurements.pointerAvoidance.changedPixels > 500, "固定时间后移动指针必须实际改变粒子位置");
  await particles.screenshot({ path: `${output}/particles-pointer.png` });
  await page.evaluate(() => { window.__freezeParticles = false; });
  checks.push("粒子避让：测试中固定动画时间，移动指针后实际像素变化超过 500，排除自然动画干扰");

  for (let i = 0; i < 3; i++) {
    await page.evaluate(() => {
      window.__oldHosts = Array.from(document.querySelectorAll('[data-testid="particles"], [data-testid="three"]'));
      window.__oldBrushGL = document.querySelector('[data-testid="brush"] canvas').getContext("webgl2");
      window.__toolCheckClear();
    });
    await page.waitForSelector('[data-testid="brush"]', { state: "detached" });
    await page.waitForTimeout(100);
    const oldState = await page.evaluate(() => window.__oldHosts.map(el => el.outerHTML));
    await page.waitForTimeout(250);
    assert.deepEqual(await page.evaluate(() => window.__oldHosts.map(el => el.outerHTML)), oldState, "卸载后粒子与三维不应继续更新");
    assert.equal(await page.evaluate(() => window.__oldBrushGL.isContextLost()), true, "笔刷卸载应释放独立画布 WebGL 上下文");
    await page.evaluate(() => window.__toolCheckRender());
    await ready(); await paintMetrics();
    const diff = difference(initialPixels, await pixels(brush.locator("canvas")));
    assert.ok(diff.meanAbsoluteRGB < 0.1, "重新挂载不应累积笔刷尺寸或残留图层");
  }
  checks.push("连续 3 次卸载/重挂：无重复画布，旧实例停止更新，笔刷上下文释放，同种子画面恢复");
  await page.evaluate(() => { window.__holdParticle = true; window.__toolCheckClear(); });
  await page.waitForSelector('[data-testid="particles"]', { state: "detached" });
  await page.evaluate(() => window.__toolCheckRender());
  await page.waitForFunction(() => !!window.__releaseParticle);
  await page.evaluate(() => { window.__pendingHost = document.querySelector('[data-testid="particles"]'); window.__toolCheckClear(); });
  await page.waitForSelector('[data-testid="particles"]', { state: "detached" });
  await page.evaluate(() => { window.__holdParticle = false; window.__releaseParticle(); });
  await page.waitForTimeout(200);
  assert.deepEqual(await page.evaluate(() => ({ canvases: window.__pendingHost.querySelectorAll("canvas").length, drew: !!window.__pendingHost.dataset.ready, looping: window.__pendingParticle.isLooping() })), { canvases: 0, drew: false, looping: false });
  await page.evaluate(() => window.__toolCheckRender());
  await ready();
  checks.push("粒子 presetup 延迟期间卸载：恢复后无遗留画布、没有绘制或循环，重新挂载正常");
  await page.screenshot({ path: `${output}/remounted.png`, fullPage: true });
  assert.ok([...brushModules].some(url => url.includes("standalone")), "页面必须加载独立版");
  assert.ok([...brushModules].every(url => url.includes("standalone")), "不得加载 p5.brush 默认插件入口");
  checks.push("模块请求仅包含 p5.brush 独立版，没有默认插件入口");
  await page.unrouteAll({ behavior: "wait" });
  await page.reload(); await ready();
  await page.evaluate(() => { window.__hmrMarker = "same-document"; window.__hmrCanvas = document.querySelector('[data-testid="brush"] canvas'); });
  const beforeHMR = await pixels(brush.locator("canvas"));
  // 仅更新时间戳触发真实 Vite HMR，不改源码内容。
  const now = new Date();
  await utimes("src/projects/tool-check/web/brush-runtime.ts", now, now);
  await page.waitForFunction(() => window.__hmrCanvas && !window.__hmrCanvas.isConnected, null, { timeout: 60000 });
  await ready(); await paintMetrics();
  assert.equal(await page.evaluate(() => window.__hmrMarker), "same-document", "HMR 检查不得被整页刷新替代");
  measurements.hotReload = difference(beforeHMR, await pixels(brush.locator("canvas")));
  assert.ok(measurements.hotReload.meanAbsoluteRGB < 0.1, "HMR 不应累积笔刷缩放");
  checks.push("真实 brush-runtime 模块热更新：未整页刷新，画布重建且同种子恢复，缩放没有累积");
  await page.addInitScript(() => {
    // 模拟隐藏浏览器面板暂停动画帧：静态水彩仍须完成，不能永久锁住按钮。
    window.requestAnimationFrame = () => 1;
    window.cancelAnimationFrame = () => {};
  });
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForSelector('[data-testid="brush"][data-ready="true"]', { timeout: 60000 });
  await paintMetrics();
  await page.getByRole("button", { name: "换一张笔触" }).evaluate(button => button.click());
  await page.waitForFunction(() => document.querySelector('[data-testid="brush"]').dataset.seed === "25", null, { polling: 100 });
  await paintMetrics();
  checks.push("动画帧暂停时，水彩首帧和换种子仍完成，按钮恢复可用");
  assert.deepEqual(errors, []);
  checks.push("无 JavaScript 异常或 console.error");
} finally {
  await writeFile(`${output}/checks.json`, JSON.stringify({ checks, measurements, limitations, errors }, null, 2));
  console.log(JSON.stringify({ checks, measurements, limitations, errors }, null, 2));
  await browser.close();
}
