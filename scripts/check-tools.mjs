import { chromium } from "playwright";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";

const outputRoot = "output/tool-check/web";
await mkdir(outputRoot, { recursive: true });
const runId = new Date().toISOString().replace(/[:.]/g, "-");
const output = await mkdtemp(`${outputRoot}/${runId}-`);
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, deviceScaleFactor: 1 });
const errors = [];
const checks = [];
const measurements = {};
page.on("pageerror", e => errors.push(e.message));
page.on("console", msg => { if (msg.type() === "error") errors.push(msg.text()); });
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
  for (const id of ["particles", "three"]) {
    await page.waitForSelector(`[data-testid="${id}"][data-ready="true"]`, { timeout: 60000 });
    assert.equal(await page.getByTestId(id).locator("canvas").count(), 1);
  }
};
try {
  await page.goto("http://127.0.0.1:5173");
  for (const id of ["particles", "three"]) {
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
    await page.reload(); await ready();
    const canvas = page.getByTestId("particles").locator("canvas");
    const before = await pixels(canvas);
    await page.waitForTimeout(200);
    assert.ok(difference(before, await pixels(canvas)).changedPixels > 500, "刷新后粒子必须持续绘制");
  }
  checks.push("连续 3 次刷新：粒子持续绘制，粒子与三维画布各一个");

  // 只在测试网络层注入 React 重挂入口和 p5 初始化延迟，不改产品代码。
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
  await page.reload(); await ready();
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
      window.__toolCheckClear();
    });
    await page.waitForSelector('[data-testid="particles"], [data-testid="three"]', { state: "detached" });
    await page.waitForTimeout(100);
    const oldState = await page.evaluate(() => window.__oldHosts.map(el => el.outerHTML));
    await page.waitForTimeout(250);
    assert.deepEqual(await page.evaluate(() => window.__oldHosts.map(el => el.outerHTML)), oldState, "卸载后粒子与三维不应继续更新");
    await page.evaluate(() => window.__toolCheckRender());
    await ready();
  }
  checks.push("连续 3 次卸载/重挂：粒子与三维无重复画布，旧实例停止更新");
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
  assert.deepEqual(errors, []);
  checks.push("无 JavaScript 异常或 console.error");
} finally {
  await writeFile(`${output}/checks.json`, JSON.stringify({ checks, measurements, errors }, null, 2));
  console.log(JSON.stringify({ output, checks, measurements, errors }, null, 2));
  await browser.close();
}
