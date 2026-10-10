import { AbsoluteFill, Composition, useCurrentFrame } from "remotion";
import { ToolCheck } from "../projects/tool-check/video/ToolCheck";

// 仅用于验证环境，正式作品放在 src/projects/，在此导入注册。
const EnvironmentCheck = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: "#faf8f3", color: "#242424", justifyContent: "center", alignItems: "center", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: 64 }}>动画工作室</h1>
      <p style={{ fontSize: 28 }}>环境检查 · 第 {frame} 帧</p>
    </AbsoluteFill>
  );
};

export const RemotionRoot = () => (
  <>
    <Composition
      id="EnvironmentCheck"
      component={EnvironmentCheck}
      durationInFrames={60}
      fps={30}
      width={1280}
      height={720}
    />
    <Composition
      id="ToolCheck"
      component={ToolCheck}
      durationInFrames={150}
      fps={30}
      width={960}
      height={540}
    />
  </>
);
