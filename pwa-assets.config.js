import {
  defineConfig,
  minimal2023Preset as base,
} from "@vite-pwa/assets-generator/config";

// The logo's tile colour, so the padding of opaque icons blends into the tile.
const TILE = "#111214";

export default defineConfig({
  preset: {
    ...base,
    maskable: { ...base.maskable, resizeOptions: { background: TILE } },
    apple: { ...base.apple, resizeOptions: { background: TILE } },
  },
  images: ["pwa-assets/logo.svg"],
});
