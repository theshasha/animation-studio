import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "./",
  publicDir: "public",
  server: { port: 5173, strictPort: true },
  build: { outDir: "output/web" },
});
