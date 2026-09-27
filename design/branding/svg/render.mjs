import { createRequire } from "node:module";
import { writeFileSync, readFileSync } from "node:fs";

const require = createRequire(import.meta.url);
const sharp = require("sharp");

const [, , svgPath, outPath] = process.argv;
const svg = readFileSync(svgPath, "utf8");

const S = 1024;
const grid = (() => {
  const lines = [];
  for (let i = 0; i <= S; i += 64) {
    const major = i % 256 === 0;
    const c = major ? "rgba(255,0,0,0.55)" : "rgba(255,0,0,0.18)";
    lines.push(`<line x1="${i}" y1="0" x2="${i}" y2="${S}" stroke="${c}" stroke-width="2"/>`);
    lines.push(`<line x1="0" y1="${i}" x2="${S}" y2="${i}" stroke="${c}" stroke-width="2"/>`);
  }
  // Android adaptive icon: 108dp canvas, 66dp safe circle, 72dp visible
  lines.push(`<circle cx="512" cy="512" r="${(S * 33) / 108}" fill="none" stroke="lime" stroke-width="3"/>`);
  lines.push(`<circle cx="512" cy="512" r="${(S * 36) / 108}" fill="none" stroke="yellow" stroke-width="2" stroke-dasharray="10 8"/>`);
  lines.push(`<line x1="512" y1="0" x2="512" y2="${S}" stroke="cyan" stroke-width="2"/>`);
  lines.push(`<line x1="0" y1="512" x2="${S}" y2="512" stroke="cyan" stroke-width="2"/>`);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}">${lines.join("")}</svg>`;
})();

const base = await sharp(Buffer.from(svg)).resize(S, S).png().toBuffer();
const withGrid = await sharp(base).composite([{ input: Buffer.from(grid) }]).png().toBuffer();

// Launcher crop: the visible 72/108 of the canvas under a circle mask
const visible = Math.round((S * 72) / 108);
const offset = Math.round((S - visible) / 2);
const cropped = await sharp(base).extract({ left: offset, top: offset, width: visible, height: visible }).resize(512, 512).toBuffer();
const mask = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"><circle cx="256" cy="256" r="256" fill="#fff"/></svg>`);
const circle = await sharp(cropped).composite([{ input: mask, blend: "dest-in" }]).png().toBuffer();

const small = async (px) => sharp(cropped).resize(px, px).composite([{ input: await sharp(mask).resize(px, px).toBuffer(), blend: "dest-in" }]).png().toBuffer();

const W = S * 2 + 60;
const H = S + 40 + 560;
const sheet = sharp({ create: { width: W, height: H, channels: 4, background: "#3a3a3a" } });
await sheet
  .composite([
    { input: base, left: 20, top: 20 },
    { input: withGrid, left: S + 40, top: 20 },
    { input: circle, left: 20, top: S + 40 },
    { input: await small(192), left: 580, top: S + 40 },
    { input: await small(96), left: 800, top: S + 40 },
    { input: await small(48), left: 920, top: S + 40 },
    { input: await sharp(await small(48)).resize(192, 192, { kernel: "nearest" }).png().toBuffer(), left: 1000, top: S + 40 },
  ])
  .png()
  .toFile(outPath);
console.log("ok", outPath);
