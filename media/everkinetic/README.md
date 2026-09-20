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

1. Import or re-import a pair:

   ```bash
   git clone https://github.com/everkinetic/data.git ../../everkinetic-data
   node scripts/import-everkinetic-frames.mjs
   ```

   The exercise-to-upstream-id map lives in that script and is the provenance
   record: it says which upstream drawing every file here came from.

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
wrong: the "one arm preacher curl" is drawn as a concentration curl, and the
"EZ bar curl" is drawn with a straight bar. Both were dropped. A pair belongs
to an exercise here only if it shows the same equipment the name promises —
this catalog splits exercises by equipment precisely so the two never disagree.
