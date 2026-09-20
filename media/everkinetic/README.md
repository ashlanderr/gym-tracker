# Imported exercise artwork

Line art from the [everkinetic data set](https://github.com/everkinetic/data),
an open data project based on everkinetic.com created by Greg Priday. The files
here are copies of `dist/svg/*.svg` from that repository, unmodified, renamed
after the exercise each pair illustrates in this app.

## License and what it obliges us to do

The data set is licensed [CC BY-SA
4.0](https://creativecommons.org/licenses/by-sa/4.0/). Commercial use is
allowed, so shipping it in a paid app is fine, but two conditions come with it:

- **Attribution.** The app must credit the source, link the license, and say
  that the artwork was modified. Nothing in the UI does that yet — it has to
  exist before release.
- **ShareAlike.** The inverted frames in
  `src/client/db/exercises/assets/*.svg` are adapted material and stay under
  CC BY-SA 4.0. That obligation attaches to those images, not to the app around
  them: the app bundles them, it is not derived from them. Keeping the
  originals here unmodified is what makes that boundary easy to point at.

This is the opposite trade-off from `../exercise-frames/`, where artwork was
drawn for this project precisely to avoid any licence at all. Both sets ship
side by side: drawn frames where they exist, imported ones for the rest of the
catalog.

## How it is wired

1. Copy a pair by hand:

   ```bash
   git clone https://github.com/everkinetic/data.git
   ```

   Upstream names its files `dist/svg/<number>-relaxation.svg` and
   `<number>-tension.svg`; find the number in its `exercises.json` by name, and
   copy the two files here as `<exercise-slug>-start.svg` and `-end.svg`. The
   slug is the exercise id from `src/client/db/exercises/catalog/` with
   underscores turned into dashes.

   There was a script for this. It was deleted once the import was done: the
   catalog it filled is settled, and a one-off map of sixty numbers is not
   worth keeping alive. Adding one more pair is two `cp` commands.

2. Build the bundled images:

   ```bash
   node scripts/prepare-exercise-images.mjs
   ```

   This inverts the colours — the art is black ink on white, the app is white
   on black — and writes the result into `src/client/db/exercises/assets/`,
   then regenerates `frames.generated.ts`.

3. Point the exercise at its frames in `src/client/db/exercises/catalog/`:

   ```ts
   asset: crossFade(EXERCISE_FRAMES.<slug>),
   ```

## Before claiming a pair, look at it

Upstream numbers drawings, not exercises, and its labels are occasionally
wrong. Found so far: "one arm preacher curl" drawn as a concentration curl,
"EZ bar curl" and "lying triceps press" drawn with a straight bar, "narrow
parallel grip chin ups" drawn with an underhand grip, "underhand pull downs"
drawn with a straight narrow grip. All of those were dropped or moved to the
exercise they actually show. A pair belongs to an exercise here only if it
shows the equipment and the grip the name promises — this catalog splits
exercises by exactly those, so a picture that disagrees is worse than none.

One picture may serve several exercises. Where a machine exists in a stack and
a plate-loaded version, the drawing shows the movement and not where the load
comes from, so both entries point at the same frames; the same goes for a
bodyweight exercise and its weighted version, where the belt is the only
difference. The leg press is the exception — the 45° plate machine and the
seated stack one do not look alike.
