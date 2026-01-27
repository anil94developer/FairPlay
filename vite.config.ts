/// <reference types="vitest" />

import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  envPrefix: "REACT_APP_",
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        icon: true, // better sizing for icons
        exportType: "named", // enables `ReactComponent` import
      },
    }),
  ],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts",
  },
  define: {
    "process.env": {},
    global: "globalThis",
  },
  server: {
    proxy: {
      "/api": {
        target: "https://api.uvwin2024.co",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
