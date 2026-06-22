import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  root: "demo",
  base: "/onyx-react/",
  plugins: [react()],
  build: {
    outDir: resolve(__dirname, "site"),
    emptyOutDir: true,
  },
});
