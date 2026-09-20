# Generated exercise artwork

Line art generated for this project, kept exactly as the model produced it.
The build flattens each frame to two colours, inverts it and bundles it as
lossless WebP — see `scripts/prepare-exercise-images.mjs` for why that is both
the smallest and the sharpest option here.

This is our own artwork: no attribution, no share-alike, nothing to carry into
the app. That only stays true as long as the everkinetic drawings are not fed
to the model. Describing their style in words is fine — style is not
copyrightable — but attaching their files as a reference makes the output
adapted material, and it inherits CC BY-SA 4.0 along with everything that
obliges. If a frame is ever made that way, it belongs in a different folder
and has to be marked.

## Drawing one

Two frames per exercise, `<slug>-start.<ext>` and `<slug>-end.<ext>`, where
`<slug>` is the exercise id from `src/client/db/exercises/catalog/` with
underscores turned into dashes. Then:

```bash
node scripts/prepare-exercise-images.mjs
```

The prompt below is the one that matched the rest of the catalog. The two
numbers in it are measured, not guessed: the imported drawings carry a single
stroke weight of about 0.75% of the image height, and they use roughly fifteen
interior lines per figure. Asking for "bolder lines" got 0.31%; asking for the
number got 0.56%, which reads correctly next to the rest.

```text
Technical exercise illustration: a man performing <exercise>.

LINE
Pure outline drawing, black on plain white. Every single line has the
same weight — contour, machine and muscle detail alike. The stroke is
heavy: about 0.75% of the image height, so at 2400 px tall that is an
18 px line. No hairlines anywhere, no thin-to-thick variation, no
tapering, no sketchy or broken strokes.
No shading, no hatching, no stippling, no gradients, no grey, no fills,
no colour, no drop shadow, no ground shadow, no frame, no border, no
text, no numbers, no watermark, no logo.

DETAIL
Keep the interior detail sparse: only the major muscle separations —
lats, trapezius, spinal groove, deltoid, triceps, calf — about fifteen
interior lines in the whole figure. No striations, no fibre detail, no
veins, no skin folds, no small clarifying lines. If a line would be
thinner than the contour to fit, leave it out.

FIGURE
Adult male athlete, lean and muscular, realistic proportions.
The head is a plain smooth oval: no face, no eyes, no mouth, no ears,
no jaw line, no hair.
Short gym shorts with a single waistband line, nothing else. Bare feet
drawn as simple outlines.

FRAMING
The figure fills the frame from top to bottom with a small even margin.
Draw only as much of the equipment as fits around him, and let the edges
of the frame cut the rest. Do not draw the whole machine and do not zoom
out to fit it.
Flat even perspective, camera at chest height, the angle that shows the
working muscles best. Portrait, about 3:4, at least 2000 px tall.

POSE
<the start position, in one or two sentences>
```

The second frame is an edit of the first, never a fresh generation:

```text
Same drawing, same style, same line weight, same camera, same framing,
same machine, same figure. Only the body moves: <the end position>. The
seat, the pads, the frame and the crop stay exactly where they are — the
two drawings are cross-faded, and anything static that shifts reads as a
glitch.
```

## What the model still gets wrong

Line weight is the thing it drifts on, in both directions, and it ignores a
reference image for it entirely — the numbers above work better than any
attachment. It also likes to add an ear and a suggestion of a jaw once the
head is turned, and to draw the whole machine when the pose is seated. Check
both before keeping a pair, and check them against each other: the point of
the pair is that only the body moves.
