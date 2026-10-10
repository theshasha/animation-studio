import { makeConfig } from "@remotion/eslint-config-flat";

export default [
  // 官方配置支持限定 Remotion 规则的目录，网页作品保留实时动画能力。
  ...makeConfig({ remotionDir: "src/video/**/*.{ts,tsx}" }),
  ...makeConfig({ remotionDir: "src/projects/tool-check/video/**/*.{ts,tsx}" }).slice(-1),
  { ignores: [".agents/**", "output/**", "node_modules/**"] },
];
