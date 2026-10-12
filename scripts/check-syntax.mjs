import { readdir } from "node:fs/promises";
import { extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = fileURLToPath(new URL("../", import.meta.url));
const extensions = new Set([".js", ".mjs", ".cjs"]);
const excludedDirectories = new Set([
  "node_modules", "output", "dist", "build", "out", ".cache", ".git",
  ".agents", ".openchamber", "playwright-report", "test-results",
]);

async function collect(directory, files) {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isFile() && extensions.has(extname(entry.name))) {
      files.push(path);
    } else if (entry.isDirectory() && !excludedDirectories.has(entry.name)) {
      if (directory !== root || entry.name === "scripts" || entry.name === "src") {
        await collect(path, files);
      }
    }
  }
}

async function main() {
  const files = [];
  await collect(root, files);
  let failed = 0;
  for (const file of files.sort()) {
    const result = spawnSync(process.execPath, ["--check", file], { stdio: "inherit" });
    if (result.error || result.status !== 0) {
      failed++;
      console.error(`语法检查失败：${relative(root, file)}`);
      if (result.error) console.error(result.error);
      if (result.signal) console.error(`进程被信号 ${result.signal} 终止`);
    }
  }
  console.log(`JavaScript 语法检查：${files.length} 个文件，${failed} 个失败`);
  if (failed) process.exitCode = 1;
}

main().catch((error) => {
  console.error("无法完成 JavaScript 语法检查：", error);
  process.exitCode = 1;
});
