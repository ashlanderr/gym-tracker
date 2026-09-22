# Figures for the sex question

Two standing figures for the onboarding step that asks about sex, generated
for this project in the same style as `../line-art/`, and the same rules
apply: our own artwork as long as the everkinetic drawings are never fed to
the model.

```bash
node scripts/prepare-figures.mjs
```

The script crops **both masters with one box** — the union of their ink
bounds — and writes white ink on transparency to
`src/client/pages/Onboarding/components/SexFigure/assets/`. The shared box is
the whole point: the cards stand side by side, and a figure cropped to its own
ink would stand taller than its neighbour. These are single frames, so they do
not go through `prepare-exercise-images.mjs`, which works in start/end pairs
and prunes its output directory.

## Drawing them

The man is generated first, the woman is an **edit of that image**, never a
fresh generation — the same trick the exercise pairs use, and the only way the
scale and the pose come out identical.

```text
Technical figure illustration: an adult man standing at rest, facing the
viewer.

LINE
Pure outline drawing, black on plain white. Every single line has the
same weight — contour and muscle detail alike. The stroke is heavy:
about 0.75% of the image height, so at 2400 px tall that is an 18 px
line. No hairlines anywhere, no thin-to-thick variation, no tapering,
no sketchy or broken strokes.
No shading, no hatching, no stippling, no gradients, no grey, no fills,
no colour, no drop shadow, no ground shadow, no frame, no border, no
text, no numbers, no watermark, no logo.

DETAIL
Keep the interior detail sparse: only the major muscle separations —
pectoral line, abdominal centre line, deltoid, biceps, quadriceps,
calf — about fifteen interior lines in the whole figure. No striations,
no fibre detail, no veins, no skin folds, no small clarifying lines. If
a line would be thinner than the contour to fit, leave it out.

FIGURE
Adult male athlete, lean and muscular, realistic proportions, broad
shoulders and narrow hips.
The head is a plain smooth oval: no face, no eyes, no mouth, no ears,
no jaw line, no hair.
Short gym shorts with a single waistband line, nothing else. Bare feet
drawn as simple outlines.

POSE
Standing upright and relaxed, weight on both feet, feet a little apart,
arms hanging at the sides with a small gap between each arm and the
body so the contour of the torso is not broken, palms facing the
thighs. Perfectly symmetrical: no turn, no lean, no step.

FRAMING
Front view, camera at chest height, no perspective distortion. The
whole figure from the top of the head to the soles of the feet,
centred, with an even margin above and below. Nothing else in the
frame. Portrait, about 3:4, at least 2000 px tall.
```

```text
Same drawing, same style, same line weight, same camera, same framing,
same crop, same pose. Only the figure changes: an adult woman, athletic
and lean, narrower shoulders and wider hips, realistic proportions. The
same plain smooth oval head: no face, no hair. Short gym shorts with a
single waistband line and a plain sports top drawn as one outline, no
straps or seam detail. Bare feet as simple outlines. The top of the
head and the soles of the feet stay exactly where they are — the two
drawings stand side by side, and any change of scale or crop reads as a
mistake.
```

The masters that shipped came back within nine pixels of each other on every
edge, so the shared crop costs nothing. If a regenerated pair drifts further
than that, redo the second image as an edit rather than widening the box.
