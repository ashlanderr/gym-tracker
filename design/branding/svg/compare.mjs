import { createRequire } from "node:module";
import { readFileSync } from "node:fs";

const require = createRequire(import.meta.url);
const sharp = require("sharp");

const [, , outPath, ...svgs] = process.argv;
const BIG = 460;
const visible = Math.round((1024 * 72) / 108);
const offset = Math.round((1024 - visible) / 2);
const circle = (px) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}"><circle cx="${px / 2}" cy="${px / 2}" r="${px / 2}" fill="#fff"/></svg>`);

const tile = async (file, px) => {
  const crop = await sharp(Buffer.from(readFileSync(file, "utf8"))).resize(1024, 1024).extract({ left: offset, top: offset, width: visible, height: visible }).toBuffer();
  return sharp(crop).resize(px, px).composite([{ input: circle(px), blend: "dest-in" }]).png().toBuffer();
};

const layers = [];
for (const [i, file] of svgs.entries()) {
  const x = 20 + i * (BIG + 20);
  layers.push({ input: await tile(file, BIG), left: x, top: 20 });
  layers.push({ input: await tile(file, 96), left: x, top: BIG + 40 });
  layers.push({ input: await tile(file, 48), left: x + 120, top: BIG + 40 });
}
await sharp({ create: { width: 20 + svgs.length * (BIG + 20), height: BIG + 160, channels: 4, background: "#3a3a3a" } })
  .composite(layers)
  .png()
  .toFile(outPath);
console.log("ok");
