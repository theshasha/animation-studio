import { useEffect, useRef, useState } from "react";
import p5 from "p5";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Pane } from "tweakpane";

export const ParticleLab = () => {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!host.current) return;
    const node = host.current;
    let cancelled = false;
    const sketch = new p5((p) => {
      p.setup = async () => {
        // p5 的异步 presetup 可能在 React 卸载后才恢复；清掉它新建的默认画布。
        if (cancelled) { p.noLoop(); await p.remove(); return; }
        p.createCanvas(640, 360); p.pixelDensity(1);
      };
      p.draw = () => {
        if (cancelled) { p.noLoop(); return; }
        p.background("#102831");
        const t = p.millis() / 1000;
        for (let i = 0; i < 220; i++) {
          const angle = i * 2.39996 + t * 0.14;
          const radius = Math.sqrt(i / 220) * 154;
          const x = 320 + Math.cos(angle) * radius * 1.6;
          const y = 180 + Math.sin(angle) * radius;
          const dx = x - p.mouseX, dy = y - p.mouseY;
          const distance = Math.hypot(dx, dy);
          const force = Math.max(0, 1 - distance / 115) * 28;
          p.noStroke();
          p.fill(i % 4 === 0 ? "#ecad71" : "#8edccc");
          p.circle(x + dx / (distance + 1) * force, y + dy / (distance + 1) * force, 2 + (i % 5));
        }
        node.dataset.ready = "true";
        node.dataset.pointer = `${p.mouseX},${p.mouseY}`;
      };
    }, node);
    return () => { cancelled = true; sketch.noLoop(); void sketch.remove(); };
  }, []);
  return <div className="canvas-host" data-testid="particles" ref={host} />;
};

export const BrushLab = () => {
  const host = useRef<HTMLDivElement>(null);
  const drawRef = useRef<((next: number) => void) | null>(null);
  const seed = useRef(24);
  const [seedLabel, setSeedLabel] = useState(24);
  const [drawing, setDrawing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!host.current) return;
    const node = host.current;
    let cancelled = false;
    let busy = false;
    let pendingDraw = 0;
    let surface: ReturnType<typeof import("./brush-runtime")["createBrushSurface"]> | undefined;
    setDrawing(true);
    setError(null);
    node.dataset.ready = "false";
    const fail = (cause: unknown) => {
      if (cancelled) return;
      console.error(cause);
      node.dataset.ready = "false";
      setError("笔刷初始化或绘制失败，请刷新重试。");
      setDrawing(false);
    };
    const draw = (next: number) => {
      if (cancelled || busy || !surface) return;
      busy = true;
      setDrawing(true);
      node.dataset.ready = "false";
      // 静态画面不依赖动画帧：隐藏标签页暂停 RAF 时也要完成首帧与按钮就绪。
      pendingDraw = window.setTimeout(() => {
        try {
          surface?.draw(next);
          seed.current = next;
          setSeedLabel(next);
          node.dataset.seed = String(next);
          // 独立版 render() 已同步提交最后一层，再公布就绪。
          node.dataset.ready = "true";
          setDrawing(false);
        } catch (cause) {
          fail(cause);
        } finally {
          busy = false;
        }
      });
    };
    // 只让水彩等待模块加载，p5 粒子可以独立启动。
    void import("./brush-runtime").then(({ createBrushSurface }) => {
      if (cancelled) return;
      surface = createBrushSurface(node);
      drawRef.current = draw;
      draw(seed.current);
    }).catch(fail);
    return () => {
      cancelled = true;
      clearTimeout(pendingDraw);
      drawRef.current = null;
      surface?.dispose();
    };
  }, []);
  return <>
    <div className="canvas-host" data-testid="brush" ref={host} />
    <div className="actions"><button disabled={drawing || !!error} onClick={() => drawRef.current?.(seed.current + 1)}>换一张笔触</button><button disabled={drawing || !!error} onClick={() => drawRef.current?.(24)}>还原种子</button><span>种子 {seedLabel}</span>{error && <span role="alert">{error}</span>}</div>
  </>;
};

export const ThreeLab = () => {
  const host = useRef<HTMLDivElement>(null);
  const controlsHost = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!host.current || !controlsHost.current) return;
    const node = host.current;
    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(640, 360); renderer.setPixelRatio(1);
    node.appendChild(renderer.domElement);
    const scene = new THREE.Scene(); scene.background = new THREE.Color("#e3e9e7");
    const camera = new THREE.PerspectiveCamera(36, 640 / 360, 0.1, 100);
    camera.position.set(0, 0.5, 6);
    const geometry = new THREE.TorusKnotGeometry(0.85, 0.25, 160, 24);
    const material = new THREE.MeshStandardMaterial({ color: "#297d7d", roughness: 0.28, metalness: 0.35 });
    const mesh = new THREE.Mesh(geometry, material); scene.add(mesh);
    scene.add(new THREE.HemisphereLight("#ffffff", "#546878", 2));
    const light = new THREE.DirectionalLight("#fff0dc", 4); light.position.set(3, 4, 5); scene.add(light);
    const orbit = new OrbitControls(camera, renderer.domElement);
    orbit.enableDamping = true; orbit.enablePan = false; orbit.minDistance = 3; orbit.maxDistance = 10;
    orbit.addEventListener("change", () => { node.dataset.camera = camera.position.toArray().join(","); });
    const settings = { rotate: true, speed: 0.5, color: "#297d7d" };
    const pane = new Pane({ container: controlsHost.current, title: "实时参数 · Tweakpane" });
    pane.addBinding(settings, "rotate", { label: "自动旋转" });
    pane.addBinding(settings, "speed", { label: "旋转速度", min: 0, max: 2 });
    pane.addBinding(settings, "color", { label: "材质颜色" }).on("change", (ev) => material.color.set(ev.value));
    let previous = 0;
    renderer.setAnimationLoop((time) => {
      const dt = previous ? Math.min((time - previous) / 1000, 0.1) : 0;
      previous = time;
      if (settings.rotate) mesh.rotation.y += dt * settings.speed;
      orbit.update(); renderer.render(scene, camera);
      node.dataset.ready = "true";
      node.dataset.rotation = String(mesh.rotation.y);
      node.dataset.color = settings.color;
    });
    return () => {
      renderer.setAnimationLoop(null); orbit.dispose(); pane.dispose();
      geometry.dispose(); material.dispose(); renderer.dispose(); renderer.domElement.remove();
    };
  }, []);
  return <><div className="canvas-host" data-testid="three" ref={host} /><div ref={controlsHost} data-testid="tweakpane" className="pane" /></>;
};
