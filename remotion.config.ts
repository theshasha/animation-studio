import { Config } from "@remotion/cli/config";

// 沿用官方空白模板配置；视频与网页共同读取根目录 public。
Config.setRspack(true);
Config.setPublicDir("public");
Config.setVideoImageFormat("jpeg");
Config.setChromiumOpenGlRenderer("angle");
Config.setOverwriteOutput(false);
