import type { CapacitorConfig } from "@capacitor/cli";

// The app is served from https://localhost inside the WebView, so calls to a
// plain HTTP development server on the local network count as mixed content.
// Only set DEV_API when building a test APK against such a server.
const isDevApi = process.env.DEV_API === "1";

const config: CapacitorConfig = {
  appId: "ru.ashlanderr.gymtracker",
  appName: "Gym Tracker",
  webDir: "dist",
  ...(isDevApi ? { android: { allowMixedContent: true } } : {}),
};

export default config;
