import { computeMuscleLevels } from "./muscles.ts";
import { EXERCISES } from "../db/exercises/constants.ts";

const BENCH_PRESS = EXERCISES["bench_press"];
const LATERAL_RAISE = EXERCISES["lateral_raise"];
const TRICEPS_PUSHDOWN = EXERCISES["triceps_pushdown_rope"];

test("muscles are ranked against the busiest one", () => {
  const levels = computeMuscleLevels([
    { exercise: BENCH_PRESS, sets: 3 },
    { exercise: LATERAL_RAISE, sets: 1 },
    { exercise: TRICEPS_PUSHDOWN, sets: 0 },
  ]);

  // Chest carries 3 as the only primary of three sets; shoulders reach the same
  // level off 1.5 secondary plus a primary set of their own; triceps sit a
  // level lower on secondary work alone, and traps scrape the bottom.
  expect(levels).toEqual({
    chest: 3,
    shoulders: 3,
    triceps: 2,
    traps: 1,
  });
});

test("nothing done means nothing highlighted", () => {
  expect(computeMuscleLevels([{ exercise: BENCH_PRESS, sets: 0 }])).toEqual({});
});
