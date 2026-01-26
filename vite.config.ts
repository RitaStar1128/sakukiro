import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "path";
import { defineConfig } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";
import { VitePWA } from "vite-plugin-pwa";

const plugins = [
  react(),
  tailwindcss(),
  jsxLocPlugin(),
  vitePluginManusRuntime(),
  VitePWA({
    registerType: "prompt",
    devOptions: {
      enabled: true,
    },
    manifest: {
      name: "サクキロ (SAKUKIRO)",
      short_name: "サクキロ",
      description: "最速の支出管理・家計簿アプリ",
      theme_color: "#ff5e00",
      background_color: "#ffffff",
      display: "standalone",
      icons: [
        {
          src: "/icon-v2-192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "/icon-v2-512.png",
          sizes: "512x512",
          type: "image/png",
        },
      ],
    },
  }),
];

export default defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    strictPort: false, // Will find next available port if 3000 is busy
    host: true,
    hmr: {
      clientPort: 443, // Force client to connect via HTTPS port
    },
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1",
      "sg1.manus.computer", // Explicitly allow current region
    ],
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
