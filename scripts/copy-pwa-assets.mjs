// The PWA assets generator writes its output next to the source image, so the
// logo used to live in public/ and shipped with every build at 1.4 MB. The
// source now sits in pwa-assets/, and this step moves the generated icons into
// public/ so that only they are published.
import { readdirSync, copyFileSync, rmSync } from "node:fs";
import { join } from "node:path";

const SOURCE_DIR = "pwa-assets";
const TARGET_DIR = "public";
const SOURCE_IMAGE = "logo.png";

const generated = readdirSync(SOURCE_DIR).filter((f) => f !== SOURCE_IMAGE);

if (generated.length === 0) {
  console.warn(`No generated icons found in ${SOURCE_DIR}`);
}

for (const file of generated) {
  copyFileSync(join(SOURCE_DIR, file), join(TARGET_DIR, file));
  rmSync(join(SOURCE_DIR, file));
  console.log(`${file} -> ${TARGET_DIR}/`);
}
