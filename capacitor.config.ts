import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.parth.animequest",
  appName: "Parth's Anime Quest",
  // Static offline bundle produced by `npm run build:android`
  webDir: "dist-android",
  android: {
    // keeps the pixel-art canvas crisp and avoids web debugging overlays in release
    allowMixedContent: false,
  },
  server: {
    androidScheme: "https",
  },
};

export default config;
