import { buildRecommendations } from "./recommendations.ts";
import { EXERCISES } from "../../db/exercises/constants.ts";
import { defaultGym } from "../../db";

const BENCH_PRESS = EXERCISES["OvlOX8JCqg0lEuaPBU3G"];
const REPS = { min: 6, max: 8 };

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
    gym: defaultGym("user"),
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
    gym: defaultGym("user"),
    reps: REPS,
  });

  expect(result.map((r) => r.weight)).toEqual([undefined, undefined]);
});
