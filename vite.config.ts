import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    target: "es2020",
    sourcemap: false
  },
  server: {
    host: true,
    port: 5173,
    strictPort: true
  },
  preview: {
    port: 5173
  }
});
