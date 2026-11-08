# Dumbbells inventory

Decisions for the dumbbells page of the inventory. The ranges and the grid
are `DumbbellRanges`, the other sections are shared with every inventory.

## What was tried

A wizard with a separate step per question. It made a short form long and
hid the result behind the last step. The single page with sections stays.

## Page

Order: why, units, one or a pair, ranges, the grid. First what changes the
meaning of every number, then the numbers.

- No "how to assemble" preview at the top.
- Every section is a label, a hint and the content. A hint adds information,
  it never repeats the label: hints in some sections only break the rhythm.
- Labels and hints differ in color, so the hierarchy reads at a glance.
- Weights are per dumbbell everywhere on this page. Only the set shows the
  total of a pair.
- No placeholders. A placeholder reads as a value and makes the field look
  optional. A cleared field stays empty.
- A tap on a range field selects its value, as the weight and reps inputs of
  the workout did: a new value is typed without erasing. The long tap menu is
  off, it would drop the selection.
- No way to turn the inventory off: the app does not work without it. The
  check on an untouched page saves the defaults. Back closes without saving,
  and the page opens again on the next tap on the weight.

## Why

The first section, "Зачем это", shared by every inventory: one hint line and
a link "Подробнее" on the next line, opening the argument in a sheet.

- A section like the others keeps the rhythm and is not louder than the
  fields. The pill and the large line of the onboarding in `main` made the
  explanation the main thing on the page, a chip read as one more setting.
- The page stays short, the sheet goes into details and numbers: only those
  who want them open it.

## Texts

Hints say it in other words than the labels and fields. A hint that asks for
an action also says what follows from it. A hint fits one line at 366px where
it stays clear: a clear hint on several lines is better than a short one that
has to be guessed.

- Units, chips "кг" / "lb" in caps by CSS: "Как подписаны веса в зале."
- Dumbbells (one or a pair): "Для пары в подходах указывается суммарный
  вес." "Weight of both" reads as typing it twice.
- Ranges: "Самая лёгкая, самая тяжёлая, разница между соседними." In the
  order of the fields. "Between neighbours", not "between dumbbells": the
  step is not the difference of any two.
- Grid, "Доступные гантели", three lines: where, the action, what follows.
  Short one line hints were not clear here. The label names what is saved
  and matches the look: lit is available, dimmed is not.
- No units next to the numbers: the units are chosen once at the top and the
  page fits one screen. Labelling only the ranges would be inconsistent, and
  every cell would mean dozens of repeats.

## Defaults

A new inventory comes filled with real values, not placeholders:

- kg: one range 10–40, step 2;
- lbs: one range 5–100, step 5;
- a pair.

The grid under the ranges shows exactly what is saved, so a default kept
without a look is still visible. Empty fields would make the first screen
look broken right when it opens itself in the middle of a workout.

## Ranges and the grid

- Ranges are number fields: from, to, step. Any value can be typed.
- One grid for all ranges, all in the units of the inventory. Mixed kg and
  lbs in one gym are not supported.
- Each range starts on a new line of the grid, ranges are separated by a gap
  without text. All ranges share the columns.
- Ranges are sorted by `from`. A weight in several ranges is shown once, in
  the first one. Overlaps are not an error.
- A range with an empty or invalid field gives no weights. Saving is off only
  when the grid is empty.
- A tap on a weight excludes it: it stays in place, dimmed, and a second tap
  returns it.

## Exclusions

An exclusion is a weight ("there is no 16"), not a position in a range, so it
survives any change of the ranges. While the page is open all exclusions are
kept. On save the ones outside every range are dropped, so the data does not
collect garbage. Narrowing a range and widening it back returns the
exclusion.

## Data

```ts
interface DumbbellWeights {
  units: WeightUnits;
  count: 1 | 2;
  ranges: { from: number; to: number; step: number }[];
  excluded: number[];
}
```

Values are in the units of the inventory. A weight snaps to the nearest
available dumbbell, times the count.

The goal is a clear model, not backward compatibility: `PerformanceWeights`
is a union with a type per equipment, so far dumbbells and the rest.

## Migration

An old dumbbells record is `steps` as a number without `base`. It becomes
`ranges: [{ from: step, to: 40, step }]` (90 for lbs) and `excluded: []`.
