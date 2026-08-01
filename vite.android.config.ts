import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { fileURLToPath } from "node:url";

/**
 * Standalone static build used for the offline Android app (Capacitor).
 * It skips SSR / TanStack Start entirely and mounts the game directly,
 * so everything ships inside the APK with no server needed.
 */
export default defineConfig({
  root: fileURLToPath(new URL("./android-shell", import.meta.url)),
  base: "./",
  plugins: [react(), tailwindcss(), tsConfigPaths({ root: process.cwd() })],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    outDir: fileURLToPath(new URL("./dist-android", import.meta.url)),
    emptyOutDir: true,
    target: "es2020",
  },
});
