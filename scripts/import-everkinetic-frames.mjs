// Copies exercise artwork from a clone of github.com/everkinetic/data into
// media/everkinetic/, naming each file after the exercise it illustrates here.
//
// The upstream drawings are two-colour line art and come in pairs — the
// relaxed and the contracted position of one movement — which is exactly the
// pair the app cross-fades between. They are copied unmodified: the colour
// inversion that makes them fit a dark UI happens in the build step, in
// scripts/prepare-exercise-images.mjs, so the originals stay re-importable.
//
// Usage: node scripts/import-everkinetic-frames.mjs [path-to-clone]
//
// The map below is the provenance record. Upstream numbers a drawing, not an
// exercise, so a pair is only claimed when it shows the same equipment our
// entry names: a picture of a barbell under "in a Smith machine" would teach
// the wrong movement, and that is the one thing this catalog exists to avoid.
// Exercises with artwork drawn for this project keep it and are absent here.

import { copyFile, mkdir, readdir, rm, stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "media", "everkinetic");
const DEFAULT_CLONE = join(ROOT, "..", "..", "everkinetic-data");

// Upstream labels are not always right, so every pair was looked at before it
// was claimed. Two were dropped for that reason: its "one arm preacher curl"
// is drawn as a concentration curl, and its "EZ bar curl" is drawn with a
// straight bar, which is the exercise next to it in this catalog.
//
// exercise id in the catalog -> upstream id_num in exercises.json
const SOURCES = {
  dumbbell_bench_press: "0055",
  smith_bench_press: "0078",
  chest_press_stack: "0066",
  incline_dumbbell_press: "0080",
  smith_incline_press: "0081",
  dips: "0054",
  dip_machine_stack: "0171",
  cable_crossover: "0048",
  dumbbell_fly: "0056",
  incline_dumbbell_fly: "0062",
  pull_up_wide: "0087",
  pull_up_parallel: "0090",
  lat_pulldown_underhand: "0095",
  lat_pulldown_close: "0096",
  barbell_row_underhand: "0026",
  t_bar_row: "0029",
  seated_cable_row_close: "0025",
  straight_arm_pulldown: "0092",
  dumbbell_pullover: "0079",
  back_extension_weighted: "0103",
  romanian_deadlift: "0118",
  deadlift: "0099",
  dumbbell_shrug: "0005",
  barbell_shrug: "0030",
  smith_shrug: "0041",
  cable_shrug: "0009",
  front_raise: "0033",
  incline_dumbbell_curl: "0214",
  hammer_curl: "0227",
  barbell_curl: "0211",
  preacher_curl_machine: "0236",
  cable_curl: "0212",
  cable_rope_curl: "0216",
  triceps_pushdown_bar: "0205",
  triceps_pushdown_v_bar: "0207",
  triceps_pushdown_reverse: "0189",
  ez_bar_skullcrusher: "0183",
  dumbbell_skullcrusher: "0184",
  overhead_dumbbell_extension: "0191",
  triceps_extension_machine: "0210",
  close_grip_bench_press: "0049",
  smith_close_grip_bench_press: "0195",
  back_squat: "0122",
  front_squat: "0138",
  smith_squat: "0124",
  hack_squat: "0123",
  leg_press_plates: "0127",
  walking_lunge: "0121",
  dumbbell_lunge: "0115",
  barbell_lunge: "0114",
  step_up: "0137",
  leg_extension: "0142",
  lying_leg_curl_stack: "0117",
  seated_leg_curl: "0119",
  standing_leg_curl: "0120",
  cable_kickback: "0112",
  hip_abduction: "0156",
  hip_adduction: "0157",
  standing_calf_raise_stack: "0282",
  seated_calf_raise: "0279",
  leg_press_calf_raise: "0273",
};

// Upstream calls the two positions relaxation and tension; the app calls them
// the start and the end of the movement.
const FRAMES = { start: "relaxation", end: "tension" };

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const clone = process.argv[2] ?? DEFAULT_CLONE;
  const svgDir = join(clone, "dist", "svg");

  if (!(await exists(svgDir))) {
    throw new Error(
      `no dist/svg in ${clone}\n` +
        "clone it first: git clone https://github.com/everkinetic/data.git",
    );
  }

  await mkdir(OUT_DIR, { recursive: true });

  const written = new Set();

  for (const [exercise, id] of Object.entries(SOURCES)) {
    const slug = exercise.replace(/_/g, "-");

    for (const [end, upstream] of Object.entries(FRAMES)) {
      const source = join(svgDir, `${id}-${upstream}.svg`);
      if (!(await exists(source))) {
        throw new Error(
          `${exercise}: upstream ${id}-${upstream}.svg is missing`,
        );
      }

      const name = `${slug}-${end}.svg`;
      await copyFile(source, join(OUT_DIR, name));
      written.add(name);
    }
  }

  // A pair dropped from the map above is a pair we no longer ship.
  for (const file of await readdir(OUT_DIR)) {
    if (file.endsWith(".svg") && !written.has(file)) {
      await rm(join(OUT_DIR, file));
      console.log(`removed stale ${file}`);
    }
  }

  console.log(
    `${Object.keys(SOURCES).length} exercises, ${written.size} files`,
  );
}

await main();
