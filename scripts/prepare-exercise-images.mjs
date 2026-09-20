// Turns the exercise masters into the images the app bundles.
//
// Each exercise is two frames — the start and the end of the movement — that
// the UI cross-fades between. There are two kinds of masters and they are
// built differently:
//
//   media/exercise-frames/  square renders drawn for this project, 2048px.
//                           Scaled down and re-encoded as WebP, deliberately
//                           keeping the framing exactly as drawn so the black
//                           around the subject stays part of the picture.
//   media/everkinetic/      two-colour line art imported from the everkinetic
//                           data set. Colours are inverted so it reads on a
//                           dark screen, and it ships as SVG.
//   media/line-art/         line art generated for this project, as whatever
//                           the model produced. Flattened to two colours and
//                           inverted, then bundled as lossless WebP.
//
// Usage: node scripts/prepare-exercise-images.mjs [--force]

import { execFile } from "node:child_process";
import {
  mkdir,
  readdir,
  readFile,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import sharp from "sharp";

const run = promisify(execFile);

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC_DIR = join(ROOT, "media", "exercise-frames");
const SVG_SRC_DIR = join(ROOT, "media", "everkinetic");
const LINE_ART_DIR = join(ROOT, "media", "line-art");
const OUT_DIR = join(ROOT, "src", "client", "db", "exercises", "assets");

// 640 rather than the size the workout card shows: the technique tab draws the
// same file much larger, and a still image at 3x on a phone wants the room.
const SIZE = 640;

// WebP, measured on one of these frames at 640px rather than picked by habit:
// q82 lands at 31.8 kB against 35.7 kB for JPEG of comparable quality, so it is
// both smaller and, at minSdk 24, universally safe — Android WebView has
// decoded lossy WebP since 4.0. AVIF would beat both but only decodes from
// Android 12, which is the same reason AV1 was rejected for video.
//
// The same measurement is why the 2048px masters in media/ are WebP too: these
// renders are smooth and half of every frame is flat black, so a master costs
// 191 kB there against 1.6 MB as JPEG. Keeping full-size masters is therefore
// nearly free, and re-cropping later never needs the original tool.
const QUALITY = 82;

// The imported art keeps its vector form instead of joining that pipeline.
// Measured on one frame: the SVG is 27.2 kB, which the APK deflates to 11.8 kB,
// against 19.9 kB for a 640px lossy WebP that cannot be deflated any further
// and is already soft on a 3x screen. Flat two-colour line art is what vector
// formats are good at; the drawn renders are shaded and are exactly what they
// are bad at, so the two kinds of master ship in different formats.
function invert(svg) {
  return svg.replace(
    /fill="#([0-9a-f]{3}|[0-9a-f]{6})"/gi,
    (_, hex) => `fill="${negate(hex)}"`,
  );
}

// Generated line art arrives as a photo-ish file — a JPEG of a drawing, with
// grey fringes around every stroke. Flattening it to two colours first is what
// makes the rest cheap: as a pure black-and-white bitmap the pair costs 4.8 kB
// at 640px and 10.8 kB at 1280px in lossless WebP, against 23 kB for the same
// frame at 640px in lossy WebP, which is also visibly worse on line art, and
// 40 kB for a vector tracing of it. Being cheap at 1280 is why it ships at
// 1280: the technique tab draws these nearly full width, where a 640px still
// is soft on a 3x screen.
const LINE_ART_SIZE = 1280;
const LINE_ART_THRESHOLD = 170;

async function buildLineArtFrame(source, outPath) {
  await sharp(source)
    .flatten({ background: "#fff" })
    .greyscale()
    .threshold(LINE_ART_THRESHOLD)
    .negate()
    .resize(LINE_ART_SIZE, LINE_ART_SIZE, { fit: "inside" })
    .webp({ lossless: true, effort: 6 })
    .toFile(outPath);
}

function negate(hex) {
  const full =
    hex.length === 3 ? [...hex].map((c) => c + c).join("") : hex.toLowerCase();

  const inverted = full
    .match(/../g)
    .map((pair) => (255 - parseInt(pair, 16)).toString(16).padStart(2, "0"))
    .join("");

  return `#${inverted}`;
}

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function encode(source, outPath) {
  // prettier-ignore
  await run("ffmpeg", [
    "-y", "-v", "error",
    "-i", source,
    "-vf", `scale=${SIZE}:${SIZE}:flags=lanczos`,
    "-c:v", "libwebp",
    "-quality", String(QUALITY),
    "-compression_level", "6",
    outPath,
  ]);
}

function identifier(slug) {
  return slug.replace(/[^A-Za-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

async function writeAssetModule(frames) {
  const names = new Map();
  for (const frame of [...frames].sort((a, b) =>
    a.slug.localeCompare(b.slug),
  )) {
    const name = identifier(frame.slug);
    if (names.has(name)) {
      throw new Error(
        `${frame.slug} and ${names.get(name).slug} collide as ${name}`,
      );
    }
    names.set(name, frame);
  }

  const imports = [...names]
    .flatMap(([name, { slug, ext }]) => [
      `import ${name}Start from "./assets/${slug}-start.${ext}";`,
      `import ${name}End from "./assets/${slug}-end.${ext}";`,
    ])
    .join("\n");

  const fields = [...names.keys()]
    .map((name) => `  ${name}: { start: ${name}Start, end: ${name}End },`)
    .join("\n");

  await writeFile(
    join(ROOT, "src", "client", "db", "exercises", "frames.generated.ts"),
    [
      "// Generated by scripts/prepare-exercise-images.mjs — do not edit.",
      "",
      imports,
      "",
      "export const EXERCISE_FRAMES = {",
      fields,
      "};",
      "",
    ].join("\n"),
  );
}

async function buildRendered(force) {
  const files = await readdir(SRC_DIR);
  const slugs = [
    ...new Set(
      files
        .filter((f) => /-start\.(webp|jpg|jpeg|png)$/i.test(f))
        .map((f) => f.replace(/-start\.(webp|jpg|jpeg|png)$/i, "")),
    ),
  ].sort();

  const sourceFor = (slug, end) =>
    files.find((f) =>
      new RegExp(`^${slug}-${end}\\.(webp|jpg|jpeg|png)$`, "i").test(f),
    );

  let built = 0;
  let skipped = 0;

  for (const slug of slugs) {
    const startName = sourceFor(slug, "start");
    const endName = sourceFor(slug, "end");
    if (!endName) throw new Error(`${slug} has a start frame but no end frame`);

    const startOut = join(OUT_DIR, `${slug}-start.webp`);
    const endOut = join(OUT_DIR, `${slug}-end.webp`);

    if (!force && (await exists(startOut)) && (await exists(endOut))) {
      skipped += 1;
      continue;
    }

    await encode(join(SRC_DIR, startName), startOut);
    await encode(join(SRC_DIR, endName), endOut);

    const bytes = (await stat(startOut)).size + (await stat(endOut)).size;
    console.log(`${slug}  ${bytes} bytes for the pair`);
    built += 1;
  }

  console.log(`rendered: ${built} built, ${skipped} up to date`);
  return slugs.map((slug) => ({ slug, ext: "webp" }));
}

async function buildImported() {
  if (!(await exists(SVG_SRC_DIR))) return [];

  const files = await readdir(SVG_SRC_DIR);
  const slugs = [
    ...new Set(
      files
        .filter((f) => f.endsWith("-start.svg"))
        .map((f) => f.replace(/-start\.svg$/, "")),
    ),
  ].sort();

  let bytes = 0;

  for (const slug of slugs) {
    for (const end of ["start", "end"]) {
      const source = join(SVG_SRC_DIR, `${slug}-${end}.svg`);
      if (!(await exists(source))) {
        throw new Error(`${slug} has no ${end} frame`);
      }

      const outPath = join(OUT_DIR, `${slug}-${end}.svg`);
      const svg = invert(await readFile(source, "utf8"));
      await writeFile(outPath, svg);
      bytes += Buffer.byteLength(svg);
    }
  }

  console.log(`imported: ${slugs.length} inverted, ${bytes} bytes total`);
  return slugs.map((slug) => ({ slug, ext: "svg" }));
}

async function buildLineArt() {
  if (!(await exists(LINE_ART_DIR))) return [];

  const files = await readdir(LINE_ART_DIR);
  const pattern = /-start\.(jpg|jpeg|png|webp)$/i;
  const slugs = [
    ...new Set(
      files.filter((f) => pattern.test(f)).map((f) => f.replace(pattern, "")),
    ),
  ].sort();

  const sourceFor = (slug, end) =>
    files.find((f) =>
      new RegExp(`^${slug}-${end}\\.(jpg|jpeg|png|webp)$`, "i").test(f),
    );

  let bytes = 0;

  for (const slug of slugs) {
    for (const end of ["start", "end"]) {
      const name = sourceFor(slug, end);
      if (!name) throw new Error(`${slug} has no ${end} frame`);

      const outPath = join(OUT_DIR, `${slug}-${end}.webp`);
      await buildLineArtFrame(join(LINE_ART_DIR, name), outPath);
      bytes += (await stat(outPath)).size;
    }
  }

  if (slugs.length) {
    console.log(`line art: ${slugs.length} flattened, ${bytes} bytes total`);
  }
  return slugs.map((slug) => ({ slug, ext: "webp" }));
}

async function main() {
  const force = process.argv.includes("--force");

  await mkdir(OUT_DIR, { recursive: true });
  await mkdir(SRC_DIR, { recursive: true });

  const frames = [
    ...(await buildRendered(force)),
    ...(await buildImported()),
    ...(await buildLineArt()),
  ];

  if (!frames.length) throw new Error(`no masters in ${SRC_DIR}`);

  const duplicates = frames
    .map(({ slug }) => slug)
    .filter((slug, i, all) => all.indexOf(slug) !== i);
  if (duplicates.length) {
    throw new Error(`${duplicates[0]} has masters in two media directories`);
  }

  // Anything left over belongs to an exercise that is no longer in the catalog.
  const keep = new Set(
    frames.flatMap(({ slug, ext }) => [
      `${slug}-start.${ext}`,
      `${slug}-end.${ext}`,
    ]),
  );
  for (const file of await readdir(OUT_DIR)) {
    if (!keep.has(file)) {
      await rm(join(OUT_DIR, file));
      console.log(`removed stale ${file}`);
    }
  }

  await writeAssetModule(frames);
  console.log(`\n${frames.length} exercises illustrated`);
}

await main();
