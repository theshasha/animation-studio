import { useRef, useState } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ParticleLab, ThreeLab } from "./CanvasLab";
import "./style.css";

gsap.registerPlugin(useGSAP);

const TimelineLab = () => {
  const scope = useRef<HTMLDivElement>(null);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const [playing, setPlaying] = useState(true);
  useGSAP(() => {
    timeline.current = gsap.timeline({ repeat: -1, yoyo: true, defaults: { duration: 1.6, ease: "power2.inOut" } })
      .to(".orb", { x: 190, rotation: 180, borderRadius: "18%", stagger: 0.18 })
      .to(".orb", { scale: 0.7, stagger: 0.12 });
  }, { scope });
  return <div ref={scope}>
    <div className="timeline-stage"><div className="orb" /><div className="orb" /><div className="orb" /></div>
    <div className="actions">
      <button onClick={() => { timeline.current?.paused(playing); setPlaying(!playing); }}>{playing ? "暂停时间轴" : "继续时间轴"}</button>
      <label>定位进度 <input aria-label="时间轴进度" type="range" min="0" max="1" step="0.01" defaultValue="0" onChange={(e) => { timeline.current?.pause().progress(Number(e.target.value)); setPlaying(false); }} /></label>
    </div>
  </div>;
};

export const App = () => <main>
  <header><span className="eyebrow">ANIMATION STUDIO / TOOL CHECK</span><h1>让工具真正动起来。</h1><p>移动、拖拽、调色，然后看一段真正导出的短片。</p><a href="http://localhost:3000/ToolCheck" target="_blank" rel="noreferrer">打开 Remotion 时间轴 ↗</a></header>
  <div className="grid">
    <section><div className="heading"><span>01 / GENERATIVE</span><h2>流动的星群</h2><p>p5.js · 移动鼠标，让粒子避开指针。</p></div><ParticleLab /></section>
    <section><div className="heading"><span>02 / WEBGL</span><h2>一枚青色的结</h2><p>Three.js · 拖拽旋转，滚轮缩放，面板调节。</p></div><ThreeLab /></section>
    <section className="timeline"><div className="heading"><span>03 / CHOREOGRAPHY</span><h2>可以拖动的时间</h2><p>GSAP + React · 暂停、继续与定位。</p></div><TimelineLab /></section>
  </div>
  <section className="film"><div className="heading"><span>04 / RENDERED FILM</span><h2>从代码到视频</h2><p>Remotion + Three.js + GSAP · 5 秒 / 30 fps / 960 × 540 · 无音轨</p></div><video controls loop preload="metadata" src={`${import.meta.env.BASE_URL}projects/tool-check/tool-check.mp4`} /></section>
  <footer>本页是工具链实测作品 · 详细结果见项目说明</footer>
</main>;
