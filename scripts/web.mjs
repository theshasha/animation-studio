import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { build, createServer } from "vite";

const root = fileURLToPath(new URL("../", import.meta.url));
const projectsDirectory = join(root, "src/projects");
const projectNamePattern = /^[\p{L}\p{N}_-]+$/u;
const projectEntry = (name) => join(projectsDirectory, name, "web/App.tsx");

async function hasEntry(name) {
  try {
    return (await stat(projectEntry(name))).isFile();
  } catch (error) {
    if (error.code === "ENOENT" || error.code === "ENOTDIR") return false;
    throw error;
  }
}

async function showUsage(message) {
  console.error(message);
  console.error("用法：npm run dev:web -- <作品名>\n      npm run build:web -- <作品名>");
  const entries = await readdir(projectsDirectory, { withFileTypes: true });
  const candidates = entries.filter((entry) => entry.isDirectory() && projectNamePattern.test(entry.name));
  const available = await Promise.all(candidates.map(async (entry) => await hasEntry(entry.name) ? entry.name : null));
  const names = available.filter((name) => name !== null).sort();
  console.error(`可用作品：\n${names.length ? names.map((name) => `  ${name}`).join("\n") : "  暂无包含 web/App.tsx 的作品"}`);
  process.exitCode = 1;
}

async function main() {
  const [mode, project, ...extra] = process.argv.slice(2);
  if (!["dev", "build"].includes(mode) || extra.length) {
    await showUsage("参数不正确，请指定操作类型和一个作品名。");
    return;
  }
  if (!project) {
    await showUsage("请指定作品。");
    return;
  }
  if (!projectNamePattern.test(project)) {
    await showUsage("作品名只能包含文字、数字、下划线和短横线，请勿传入路径。");
    return;
  }
  if (!await hasEntry(project)) {
    await showUsage(`未找到作品入口：src/projects/${project}/web/App.tsx`);
    return;
  }

  const config = {
    root,
    configFile: join(root, "vite.config.ts"),
    resolve: { alias: { "@current-project": projectEntry(project) } },
  };
  console.log(`当前网页作品：${project}`);
  if (mode === "build") {
    await build(config);
  } else {
    const server = await createServer({ ...config, server: { host: "127.0.0.1" } });
    await server.listen();
    server.printUrls();
    server.bindCLIShortcuts({ print: true });
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
