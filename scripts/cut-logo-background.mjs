// Image generators hand the logo back as an opaque square: the dark tile on a
// white canvas. The icon pipeline needs the canvas transparent, both for the
// PWA icons and to find the tile in generate-app-assets. This cuts the white
// away, flood-filling from the edges so the white glyph inside the tile stays.
import sharp from "sharp";

const [input, output = "pwa-assets/logo.png"] = process.argv.slice(2);

if (!input) {
  console.error("usage: node scripts/cut-logo-background.mjs <input> [output]");
  process.exit(1);
}

const { data, info } = await sharp(input)
  .removeAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
const { width, height } = info;
const count = width * height;

const luma = (i) =>
  0.2126 * data[i * 3] + 0.7152 * data[i * 3 + 1] + 0.0722 * data[i * 3 + 2];

// The tile is the darkest large area; its median is robust to glyph pixels.
const dark = [];
for (let i = 0; i < count; i++) if (luma(i) < 128) dark.push(i);
if (dark.length === 0) throw new Error(`Found no tile in ${input}`);
dark.sort((a, b) => luma(a) - luma(b));
const tilePixel = dark[dark.length >> 1];
const tile = [0, 1, 2].map((c) => data[tilePixel * 3 + c]);
const tileLuma = luma(tilePixel);

// Anything noticeably lighter than the tile and reachable from the border is
// canvas or the anti-aliased rim between canvas and tile.
const CANVAS_MIN_LUMA = tileLuma + 24;
const outside = new Uint8Array(count);
const queue = new Int32Array(count);
let head = 0;
let tail = 0;
const visit = (i) => {
  if (outside[i] || luma(i) < CANVAS_MIN_LUMA) return;
  outside[i] = 1;
  queue[tail++] = i;
};
for (let x = 0; x < width; x++) {
  visit(x);
  visit((height - 1) * width + x);
}
for (let y = 0; y < height; y++) {
  visit(y * width);
  visit(y * width + width - 1);
}
while (head < tail) {
  const i = queue[head++];
  const x = i % width;
  if (x > 0) visit(i - 1);
  if (x < width - 1) visit(i + 1);
  if (i >= width) visit(i - width);
  if (i < count - width) visit(i + width);
}

// A rim pixel is the tile blended over white, so its darkness gives coverage.
const out = Buffer.alloc(count * 4);
for (let i = 0; i < count; i++) {
  const o = i * 4;
  if (outside[i]) {
    const coverage = (255 - luma(i)) / (255 - tileLuma);
    out[o] = tile[0];
    out[o + 1] = tile[1];
    out[o + 2] = tile[2];
    out[o + 3] = Math.round(Math.min(1, Math.max(0, coverage)) * 255);
  } else {
    out[o] = data[i * 3];
    out[o + 1] = data[i * 3 + 1];
    out[o + 2] = data[i * 3 + 2];
    out[o + 3] = 255;
  }
}

await sharp(out, { raw: { width, height, channels: 4 } }).png().toFile(output);
console.log(
  `tile rgb(${tile.join(",")}), cut ${tail} canvas pixels -> ${output}`,
);
