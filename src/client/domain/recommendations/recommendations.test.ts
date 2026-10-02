import { buildRecommendations } from "./recommendations.ts";
import { EXERCISES } from "../../db/exercises/constants.ts";
import { defaultGym } from "../../db";

const BENCH_PRESS = EXERCISES["bench_press"];
const REPS = { min: 6, max: 8 };
const GYM = {
  ...defaultGym("user"),
  bars: { units: "kg" as const, items: [20] },
  plates: { units: "kg" as const, items: [20, 10, 5, 2.5, 1.25] },
};

const draft = (type: "warm-up" | "working") => ({
  type,
  weight: undefined,
  reps: undefined,
});

const done = (weight: number) => ({
  type: "working" as const,
  weight,
  reps: 8,
});

test("working sets repeat the weight of the same set last time", () => {
  const result = buildRecommendations({
    currentSets: [draft("warm-up"), ...Array(4).fill(draft("working"))],
    previousSets: [done(60), done(60), done(57.5)],
    exercise: BENCH_PRESS,
    gym: GYM,
    reps: REPS,
  });

  expect(result.map((r) => r.weight)).toEqual([35, 60, 60, 57.5, 57.5]);
  expect(result.at(-1)?.reps).toEqual(REPS);
});

test("without history nothing is suggested", () => {
  const result = buildRecommendations({
    currentSets: [draft("warm-up"), draft("working")],
    previousSets: [],
    exercise: BENCH_PRESS,
    gym: GYM,
    reps: REPS,
  });

  expect(result.map((r) => r.weight)).toEqual([undefined, undefined]);
});
