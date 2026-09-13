import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// Capacitor serves the bundle from a local origin root and has its own
// offline story, so the PWA service worker and the GitHub Pages base path
// only apply to the web build.
const isCapacitor = process.env.BUILD_TARGET === "capacitor";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    ...(isCapacitor
      ? []
      : [
          VitePWA({
            registerType: "autoUpdate",
            manifest: {
              name: "Gym Tracker",
              short_name: "Gym Tracker",
              theme_color: "#000000",
              background_color: "transparent",
              icons: [
                {
                  src: "pwa-192x192.png",
                  sizes: "192x192",
                  type: "image/png",
                },
                {
                  src: "pwa-512x512.png",
                  sizes: "512x512",
                  type: "image/png",
                },
              ],
            },
            workbox: {
              globPatterns: [
                "**/*.{js,wasm,css,html,ico,png,svg,mp3,jpg,jpeg,webp}",
              ],
            },
          }),
        ]),
  ],
  base: isCapacitor ? "./" : "/gym-tracker/",
  server: {
    proxy: {
      "/api": { target: "http://localhost:5000", changeOrigin: true },
      "/trpc": { target: "http://localhost:5000", changeOrigin: true },
    },
  },
  test: {
    include: ["**/*.test.ts"],
    globals: true,
  },
});
