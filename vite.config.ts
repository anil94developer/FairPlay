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
        target: "https://usabet9.com",
        changeOrigin: true,
        // /api/user/userLogin -> https://usabet9.com/api/v1/user/userLogin
        rewrite: (path) => path.replace(/^\/api/, "/api/v1"),
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq) => {
            // Some backends validate Origin and return "Invalid token" for localhost origins.
            proxyReq.setHeader("origin", "https://usabet9.com");
          });
        },
      },
    },
  },
});
