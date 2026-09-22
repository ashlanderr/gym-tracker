// Turns the two onboarding masters into the images the sex question shows.
//
// They are not exercises: one frame each, no cross-fade, and they live beside
// the component rather than in the exercise assets, which
// prepare-exercise-images.mjs prunes of anything not in its catalogue.
//
// What matters here is that both drawings are cropped with the SAME box. The
// cards stand side by side, so a figure cropped to its own ink would come out
// a different height than its neighbour and the pair would read as two
// unrelated drawings. The box is the union of the two ink bounds.
//
// Usage: node scripts/prepare-figures.mjs

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC_DIR = join(ROOT, "media", "figures");
const OUT_DIR = join(
  ROOT,
  "src",
  "client",
  "pages",
  "Onboarding",
  "components",
  "SexFigure",
  "assets",
);

const NAMES = ["man", "woman"];

// The same threshold the generated exercise line art uses: these arrive as
// JPEGs of a drawing, with grey fringes around every stroke.
const THRESHOLD = 170;

// Tall enough for the card at 3x, and lossless line art on transparency is a
// few kilobytes either way.
const HEIGHT = 720;

const MARGIN = 0.02;

async function inkBounds(file) {
  const { data, info } = await sharp(file)
    .flatten({ background: "#fff" })
    .greyscale()
    .threshold(THRESHOLD)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const bounds = {
    minX: info.width,
    minY: info.height,
    maxX: -1,
    maxY: -1,
    width: info.width,
    height: info.height,
  };

  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      if (data[y * info.width + x] !== 0) continue;
      bounds.minX = Math.min(bounds.minX, x);
      bounds.maxX = Math.max(bounds.maxX, x);
      bounds.minY = Math.min(bounds.minY, y);
      bounds.maxY = Math.max(bounds.maxY, y);
    }
  }

  return bounds;
}

// White ink carried in the alpha channel, so the card can dim it or tint it
// without a second copy of the drawing.
async function write(file, crop, outPath) {
  const alpha = await sharp(file)
    .flatten({ background: "#fff" })
    .greyscale()
    .threshold(THRESHOLD)
    .extract(crop)
    .negate()
    .resize({ height: HEIGHT })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height } = alpha.info;

  await sharp({
    create: { width, height, channels: 3, background: "#ffffff" },
  })
    .joinChannel(alpha.data, { raw: { width, height, channels: 1 } })
    .webp({ lossless: true, effort: 6 })
    .toFile(outPath);

  return { width, height };
}

const sources = NAMES.map((name) => join(SRC_DIR, `${name}.jpg`));
const bounds = await Promise.all(sources.map(inkBounds));

const union = {
  minX: Math.min(...bounds.map((b) => b.minX)),
  minY: Math.min(...bounds.map((b) => b.minY)),
  maxX: Math.max(...bounds.map((b) => b.maxX)),
  maxY: Math.max(...bounds.map((b) => b.maxY)),
};

const margin = Math.round((union.maxY - union.minY) * MARGIN);
const left = Math.max(0, union.minX - margin);
const top = Math.max(0, union.minY - margin);

// Clamped to the smaller master: the two are not pixel-identical in size.
const right = Math.min(...bounds.map((b) => b.width), union.maxX + margin + 1);
const bottom = Math.min(
  ...bounds.map((b) => b.height),
  union.maxY + margin + 1,
);

const crop = { left, top, width: right - left, height: bottom - top };

for (const [i, file] of sources.entries()) {
  const size = await write(file, crop, join(OUT_DIR, `${NAMES[i]}.webp`));
  console.log(`${NAMES[i]}: ${size.width}x${size.height}`);
}
