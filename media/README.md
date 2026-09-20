# Exercise media

Master artwork for the exercise catalog. Nothing here ships: the build reads
these files, shrinks them, and writes the results into
`src/client/db/exercises/assets/`, which is what the app bundles.

## What is here

- `everkinetic/` — line art imported from an open data set, two SVG frames per
  exercise, under CC BY-SA 4.0. It covers the exercises nothing has been drawn
  for yet; `everkinetic/README.md` covers the import and what the licence
  obliges us to do.
- `exercise-frames/` — two square frames per exercise, `<slug>-start.webp` and
  `<slug>-end.webp`, at 2048px. They are the start and the end position of one
  movement, drawn from the same camera so the app can cross-fade between them.
- `character-reference.webp` — the anatomical figure every exercise is drawn
  from. It is not used by the app and is never bundled. It exists so that new
  frames can be generated with the same body, shading, shorts and lighting as
  the ones already in the catalog; without it a new exercise comes out looking
  like it belongs to a different set.

## Adding an exercise

1. Draw the pair of frames and save them as
   `media/exercise-frames/<slug>-start.webp` and `<slug>-end.webp`.

   Both frames must share the camera, the distance, the lighting, the equipment
   placement and the pure black background — only the body position and the
   moving parts of the machine may differ. If the two frames disagree about
   where anything static sits, the cross-fade reads as a jump rather than a
   movement.

2. Build the bundled images:

   ```bash
   node scripts/prepare-exercise-images.mjs
   ```

   This writes a 640px pair into `src/client/db/exercises/assets/` and
   regenerates `src/client/db/exercises/frames.generated.ts`. The generated
   module is not edited by hand. Files in `assets/` that no longer have a master
   are deleted, so removing a pair here removes it from the app.

3. Add the exercise to `src/client/db/exercises/constants.ts`, pointing its
   asset at the new frames:

   ```ts
   asset: crossFade(EXERCISE_FRAMES.<slug>),
   ```

   `<slug>` is the file name with dashes turned into underscores.

4. Check it renders: `npm run dev`, then open the exercise page and a workout.

## Why this artwork is generated rather than licensed

Libraries of ready-made exercise animations exist and sell per clip. They were
the first thing considered and rejected on cost: at roughly a dollar a clip the
budget covered about half the catalog, and a half-illustrated catalog is worse
than a small complete one.

The stronger reason is distribution. This app is meant to be sold, and shipping
licensed clips inside a paid product is exactly what those licenses restrict —
the risk lands on us, not on the vendor. Artwork generated for this project
carries no such restriction.

The frames are therefore drawn rather than bought, and the masters are kept here
so they can always be re-cropped, re-sized or re-encoded without going back to
the tool that made them.

The imported set in `everkinetic/` is the pragmatic half of the same decision:
it is free to use commercially, so it fills the catalog now, at the price of an
attribution the app still owes and a share-alike obligation on the adapted
images. Anything redrawn here later replaces it.
