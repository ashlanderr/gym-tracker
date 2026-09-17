import { computeMuscleLevels } from "./muscles.ts";
import { EXERCISES } from "../db/exercises/constants.ts";

const BENCH_PRESS = EXERCISES["OvlOX8JCqg0lEuaPBU3G"];
const BUTTERFLY = EXERCISES["tX9HxwCkIckqNaEaf2Dq"];
const CALF_RAISE = EXERCISES["h0rIMeYCULTorlXLyPYq"];

test("muscles are ranked against the busiest one", () => {
  const levels = computeMuscleLevels([
    { exercise: BENCH_PRESS, sets: 3 },
    { exercise: BUTTERFLY, sets: 3 },
    { exercise: CALF_RAISE, sets: 1 },
    { exercise: CALF_RAISE, sets: 0 },
  ]);

  expect(levels).toEqual({
    chest: 3,
    triceps: 1,
    shoulders: 1,
    calves: 1,
  });
});

test("nothing done means nothing highlighted", () => {
  expect(computeMuscleLevels([{ exercise: BENCH_PRESS, sets: 0 }])).toEqual({});
});
