import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Resolve the workspace package from source so Vite doesn't need
      // a built dist/ folder during development
      "@oss-platform/capital-streaming": path.resolve(
        __dirname,
        "../../packages/capital-streaming/src/index.ts"
      ),
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
});
