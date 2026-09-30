import { spawnSync } from "node:child_process";
import { glob, mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import sharp from "sharp";

const SOURCE = "pwa-assets/logo.svg";
const ASSET_DIR = "assets";
const RES_DIR = "android/app/src/main/res";
// RuStore wants the listing icon to match the launcher one.
const STORE_ICON = "design/store/icon-512.png";
const STORE_ICON_SIZE = 512;

const ICON_SIZE = 1024;
// @capacitor/assets insets both adaptive layers by 16.7%, mapping a source image
// onto the 72dp visible area of the 108dp canvas. This fraction keeps the glyph
// inside the 66dp circle every launcher mask is guaranteed to show.
const GLYPH_SCALE = 0.74;
// The logo draws the glyph over this element; the adaptive icon takes its
// colour for the background layer and the rest for the foreground.
const TILE = /<rect id="tile"[^>]*\/>/;

// 108dp adaptive canvas at each density's scale.
const ADAPTIVE_DP = 108;
// Launchers before adaptive icons (API 24-25) draw a flat 48dp image.
const LEGACY_DP = 48;
const ADAPTIVE_SIZES = {
  mdpi: 108,
  hdpi: 162,
  xhdpi: 216,
  xxhdpi: 324,
  xxxhdpi: 432,
};

const SPLASH_SIZE = 2732;
// Splash templates are cropped to cover both orientations, so the logo stays
// small enough that no aspect ratio cuts it off.
const SPLASH_LOGO_SCALE = 0.25;
const SPLASH_BACKGROUND = { r: 0, g: 0, b: 0, alpha: 1 };

async function readLogo() {
  const svg = await readFile(SOURCE, "utf8");
  const tile = svg.match(TILE)?.[0];
  if (!tile) throw new Error(`${SOURCE} has no <rect id="tile">`);

  const colour = tile.match(/fill="([^"]+)"/)?.[1];
  if (!colour) throw new Error(`The tile in ${SOURCE} has no fill`);

  return { colour, glyph: svg.replace(TILE, "") };
}

function buildIconOnly() {
  return sharp(SOURCE).resize(ICON_SIZE, ICON_SIZE).png().toBuffer();
}

function buildIconBackground(colour) {
  return sharp({
    create: {
      width: ICON_SIZE,
      height: ICON_SIZE,
      channels: 4,
      background: colour,
    },
  })
    .png()
    .toBuffer();
}

async function buildIconForeground(logo) {
  const glyph = await sharp(Buffer.from(logo.glyph), { density: 300 })
    .trim()
    .toBuffer();
  const fitted = await sharp(glyph)
    .resize({
      width: Math.round(ICON_SIZE * GLYPH_SCALE),
      height: Math.round(ICON_SIZE * GLYPH_SCALE),
      fit: "inside",
    })
    .toBuffer();

  return sharp({
    create: {
      width: ICON_SIZE,
      height: ICON_SIZE,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: fitted, gravity: "centre" }])
    .png()
    .toBuffer();
}

async function buildSplash() {
  const logo = await sharp(SOURCE)
    .resize(Math.round(SPLASH_SIZE * SPLASH_LOGO_SCALE))
    .toBuffer();

  return sharp({
    create: {
      width: SPLASH_SIZE,
      height: SPLASH_SIZE,
      channels: 4,
      background: SPLASH_BACKGROUND,
    },
  })
    .composite([{ input: logo, gravity: "centre" }])
    .png()
    .toBuffer();
}

const logo = await readLogo();

const background = await buildIconBackground(logo.colour);
const foreground = await buildIconForeground(logo);

await rm(ASSET_DIR, { recursive: true, force: true });
await mkdir(ASSET_DIR, { recursive: true });

await writeFile(join(ASSET_DIR, "icon-only.png"), await buildIconOnly());
await writeFile(join(ASSET_DIR, "icon-background.png"), background);
await writeFile(join(ASSET_DIR, "icon-foreground.png"), foreground);
// No splash-dark.png: the app is dark either way, so the -night drawables would
// be byte-for-byte copies. Android falls back to the unqualified ones itself.
await writeFile(join(ASSET_DIR, "splash.png"), await buildSplash());

const require = createRequire(import.meta.url);
const cli = join(
  dirname(require.resolve("@capacitor/assets/package.json")),
  "bin",
  "capacitor-assets",
);

const { status } = spawnSync(
  process.execPath,
  [cli, "generate", "--android", "--assetPath", ASSET_DIR],
  { stdio: "inherit" },
);

await rm(ASSET_DIR, { recursive: true, force: true });

if (status !== 0) process.exit(status ?? 1);

// minSdkVersion is 24, long past any ~120dpi screen, and Android falls back to
// mdpi anyway.
for (const dir of ["mipmap-ldpi", "drawable-land-ldpi", "drawable-port-ldpi"]) {
  await rm(join(RES_DIR, dir), { recursive: true, force: true });
}

// The source images map onto the 72dp a launcher shows, so the two layers
// stacked are the icon as a phone draws it before masking the corners.
const stacked = await sharp(background)
  .composite([{ input: foreground }])
  .toBuffer();

// @capacitor/assets cuts the round legacy icon out of the rounded tile, so
// the circle clips the tile's corners into an octagon. Masking the stacked
// layers instead gives a full circle, the same one an adaptive launcher shows.
const circle = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${ICON_SIZE}" height="${ICON_SIZE}">` +
    `<circle cx="50%" cy="50%" r="50%"/></svg>`,
);
const roundIcon = await sharp(stacked)
  .composite([{ input: circle, blend: "dest-in" }])
  .png()
  .toBuffer();

// @capacitor/assets sizes the adaptive layers from its legacy icon templates,
// 48dp per density, leaving the 108dp canvas to upscale them 2.25x.
for (const [density, size] of Object.entries(ADAPTIVE_SIZES)) {
  const dir = join(RES_DIR, `mipmap-${density}`);
  await sharp(background)
    .resize(size, size)
    .png()
    .toFile(join(dir, "ic_launcher_background.png"));
  await sharp(foreground)
    .resize(size, size)
    .png()
    .toFile(join(dir, "ic_launcher_foreground.png"));
  const legacySize = (size * LEGACY_DP) / ADAPTIVE_DP;
  await sharp(roundIcon)
    .resize(legacySize, legacySize)
    .png()
    .toFile(join(dir, "ic_launcher_round.png"));
}

let saved = 0;

for await (const file of glob(`${RES_DIR}/**/*.png`)) {
  const packed = await sharp(file)
    .png({ palette: true, effort: 10 })
    .toBuffer();
  const before = (await stat(file)).size;
  if (packed.length < before) {
    await writeFile(file, packed);
    saved += before - packed.length;
  }
}

console.log(`repacked PNGs, saved ${(saved / 1024).toFixed(0)} KB`);

await mkdir(dirname(STORE_ICON), { recursive: true });
await sharp(stacked)
  .resize(STORE_ICON_SIZE, STORE_ICON_SIZE)
  .png()
  .toFile(STORE_ICON);
