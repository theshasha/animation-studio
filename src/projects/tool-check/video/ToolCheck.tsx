import { useGsapTimeline } from "@remotion/gsap";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

const RotatingSculpture = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const time = frame / fps;
  const entrance = interpolate(frame, [0, fps], [0.8, 1], { extrapolateRight: "clamp" });

  return (
    <group position={[2.55, 0.12, 0]} scale={entrance}>
      <mesh rotation={[0.45 + time * 0.18, time * 0.55, -0.2 + time * 0.12]}>
        <torusKnotGeometry args={[1.18, 0.33, 160, 24, 2, 3]} />
        <meshStandardMaterial color="#178c7e" roughness={0.3} metalness={0.32} />
      </mesh>
      <mesh rotation={[1.08, 0.24, -time * 0.2]}>
        <torusGeometry args={[2.06, 0.012, 8, 128]} />
        <meshBasicMaterial color="#a68858" />
      </mesh>
      <mesh position={[Math.cos(time * 0.75) * 2.06, Math.sin(time * 0.75) * 0.95, 0.8]}>
        <sphereGeometry args={[0.065, 16, 16]} />
        <meshStandardMaterial color="#dca55b" roughness={0.3} metalness={0.3} />
      </mesh>
    </group>
  );
};

export const ToolCheck = () => {
  const frame = useCurrentFrame();
  const { width, height, fps, durationInFrames } = useVideoConfig();
  // Remotion owns the paused GSAP timeline and seeks it for every captured frame.
  const scope = useGsapTimeline<HTMLDivElement>(({ timeline, selector }) => {
    timeline
      .fromTo(selector("[data-kicker]"), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.65, ease: "power3.out" }, 0.1)
      .fromTo(selector("[data-title]"), { autoAlpha: 0, y: 38 }, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.14, ease: "power3.out" }, 0.22)
      .fromTo(selector("[data-detail]"), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.1, ease: "power2.out" }, 0.85)
      .fromTo(selector("[data-rule]"), { scaleX: 0 }, { scaleX: 1, duration: 1.1, ease: "power3.inOut", transformOrigin: "left center" }, 0.3)
      .fromTo(selector("[data-seal]"), { autoAlpha: 0, scale: 0.85, rotation: -12 }, { autoAlpha: 1, scale: 1, rotation: 0, duration: 0.8, ease: "power3.out" }, 1.3);
  });

  return (
    <AbsoluteFill ref={scope} style={{ backgroundColor: "#f3f0e8", color: "#153e38", fontFamily: '"Microsoft YaHei", "Segoe UI", sans-serif' }}>
      <AbsoluteFill style={{ backgroundImage: "radial-gradient(circle at 74% 44%, #e1e8da 0%, transparent 43%)" }} />
      <div style={{ position: "absolute", left: 525, top: 98, width: 335, height: 335, border: "1px solid #d7dacd", borderRadius: "50%" }} />
      <div style={{ position: "absolute", left: 578, top: 151, width: 229, height: 229, border: "1px dashed #d1d6c9", borderRadius: "50%" }} />

      <ThreeCanvas
        width={width}
        height={height}
        premountFor={fps}
        orthographic
        camera={{ position: [0, 0, 10], zoom: 78, near: 0.1, far: 100 }}
        dpr={1}
        gl={{ antialias: true, alpha: true }}
        style={{ position: "absolute", inset: 0 }}
      >
        <ambientLight intensity={1.1} />
        <directionalLight position={[-3, 5, 6]} intensity={3.2} color="#fff2d6" />
        <directionalLight position={[5, -2, 3]} intensity={1.8} color="#9be4d9" />
        <RotatingSculpture />
      </ThreeCanvas>

      <div data-kicker style={{ position: "absolute", left: 64, top: 62, fontSize: 13, letterSpacing: 3.2, fontWeight: 600 }}>
        动画工作室 / MOTION STUDIES
      </div>
      <div style={{ position: "absolute", left: 61, top: 148, fontSize: 65, fontWeight: 700, lineHeight: 1.3, letterSpacing: -2 }}>
        <div data-title>让想象</div>
        <div data-title>逐帧成形。</div>
      </div>
      <div data-rule style={{ position: "absolute", left: 66, top: 346, width: 62, height: 3, backgroundColor: "#bb9155" }} />
      <div data-detail style={{ position: "absolute", left: 65, top: 372, fontSize: 17, color: "#567067", letterSpacing: 1 }}>
        几何、光影与时间的协同实验
      </div>
      <div data-detail style={{ position: "absolute", left: 66, top: 408, fontSize: 11, letterSpacing: 1.5, color: "#6d7d71" }}>
        REMOTION × THREE.JS × GSAP
      </div>
      <div data-seal style={{ position: "absolute", right: 64, top: 58, width: 46, height: 46, border: "1px solid #a9b6a5", borderRadius: "50%", display: "grid", placeItems: "center", fontFamily: "Georgia, serif", fontSize: 18 }}>
        01
      </div>
      <div style={{ position: "absolute", left: 64, right: 64, bottom: 51, height: 1, backgroundColor: "#d7dacc" }}>
        <div style={{ height: 1, width: "100%", backgroundColor: "#527566", transformOrigin: "left", scale: `${frame / (durationInFrames - 1)} 1` }} />
      </div>
      <div style={{ position: "absolute", left: 64, right: 64, bottom: 25, display: "flex", justifyContent: "space-between", fontSize: 10, letterSpacing: 2, color: "#708071", fontVariantNumeric: "tabular-nums" }}>
        <span>工具链实测 / FRAME-DRIVEN</span>
        <span>{String(frame + 1).padStart(3, "0")} / {durationInFrames} · {fps} FPS</span>
      </div>
    </AbsoluteFill>
  );
};
