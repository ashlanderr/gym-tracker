import { spawnSync } from "node:child_process";
import { glob, mkdir, rm, stat, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import sharp from "sharp";

const SOURCE = "pwa-assets/logo.png";
const ASSET_DIR = "assets";
const RES_DIR = "android/app/src/main/res";

const ICON_SIZE = 1024;
// @capacitor/assets insets both adaptive layers by 16.7%, mapping a source image
// onto the 72dp visible area of the 108dp canvas. This fraction keeps the glyph
// inside the 66dp circle every launcher mask is guaranteed to show.
const GLYPH_SCALE = 0.74;
// Above this the pixel is glyph; below it, the tile behind the glyph.
const GLYPH_MIN_LUMA = 96;
const GLYPH_FULL_LUMA = 208;

// 108dp adaptive canvas at each density's scale.
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

const luma = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

async function readLogo() {
  const { data, info } = await sharp(SOURCE)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  if (info.width !== info.height) {
    throw new Error(`${SOURCE} must be square, got ${info.width}x${info.height}`);
  }

  return { data, width: info.width, height: info.height };
}

function tileBounds({ data, width, height }) {
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] < 128) continue;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }

  if (maxX < 0) throw new Error(`${SOURCE} is fully transparent`);

  return { minX, minY, maxX, maxY };
}

function tileColour({ data, width, height }) {
  let r = 0;
  let g = 0;
  let b = 0;
  let count = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      if (data[i + 3] < 250) continue;
      if (luma(data[i], data[i + 1], data[i + 2]) >= GLYPH_MIN_LUMA) continue;
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
      count++;
    }
  }

  if (count === 0) throw new Error(`Found no tile pixels in ${SOURCE}`);

  return {
    r: Math.round(r / count),
    g: Math.round(g / count),
    b: Math.round(b / count),
    alpha: 1,
  };
}

// Promoting brightness to opacity lifts the white glyph off its tile, so the
// adaptive foreground carries no second tile over the background layer.
function glyphLayer({ data, width, height }) {
  const out = Buffer.alloc(width * height * 4);

  for (let i = 0; i < width * height; i++) {
    const o = i * 4;
    const value = luma(data[o], data[o + 1], data[o + 2]);
    const ramp = (value - GLYPH_MIN_LUMA) / (GLYPH_FULL_LUMA - GLYPH_MIN_LUMA);
    const coverage = Math.min(1, Math.max(0, ramp));
    out[o] = 255;
    out[o + 1] = 255;
    out[o + 2] = 255;
    out[o + 3] = Math.round(coverage * data[o + 3]);
  }

  return sharp(out, { raw: { width, height, channels: 4 } }).png();
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
  const glyph = await glyphLayer(logo).trim().toBuffer();
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
const bounds = tileBounds(logo);
const colour = tileColour(logo);

console.log(
  `tile ${bounds.maxX - bounds.minX + 1}x${bounds.maxY - bounds.minY + 1} ` +
    `at ${bounds.minX},${bounds.minY} on rgb(${colour.r},${colour.g},${colour.b})`,
);

const background = await buildIconBackground(colour);
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
}

let saved = 0;

for await (const file of glob(`${RES_DIR}/**/*.png`)) {
  const packed = await sharp(file).png({ palette: true, effort: 10 }).toBuffer();
  const before = (await stat(file)).size;
  if (packed.length < before) {
    await writeFile(file, packed);
    saved += before - packed.length;
  }
}

console.log(`repacked PNGs, saved ${(saved / 1024).toFixed(0)} KB`);
