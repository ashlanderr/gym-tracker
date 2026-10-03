import { buildRecommendations } from "./recommendations.ts";
import { startWeightKg } from "./start.ts";
import { planWarmUps } from "./warm-up.ts";
import type { RecommendationParams, SetData } from "./types.ts";
import { EXERCISES } from "../../db/exercises/constants.ts";
import { defaultGym, type Effort, type Gym } from "../../db";

const exercise = (id: string) => EXERCISES[id];

const GYM: Gym = {
  ...defaultGym("user"),
  bars: { units: "kg", items: [20] },
  plates: { units: "kg", items: [20, 10, 5, 2.5, 1.25] },
  dumbbells: [{ units: "kg", min: 2, max: 30, step: 2 }],
  stacks: {
    lat_pulldown_wide: { units: "kg", base: 5, step: 5, max: 100 },
    assisted_pull_up_wide: { units: "kg", base: 5, step: 5, max: 80 },
  },
};

const done = (weight: number, reps: number, effort?: Effort): SetData => ({
  type: "working",
  weight,
  reps,
  completed: true,
  effort,
});

const draft: SetData = {
  type: "working",
  weight: undefined,
  reps: undefined,
  completed: false,
};

function recommend(
  id: string,
  currentSets: SetData[],
  patch: Partial<RecommendationParams> = {},
) {
  return buildRecommendations({
    currentSets,
    previousSets: [],
    exercise: exercise(id),
    gym: GYM,
    reps: exercise(id).reps,
    sex: "male",
    selfWeight: 80,
    isFirstOfMovement: false,
    ...patch,
  });
}

test("a new exercise starts on the safe weight within the equipment", () => {
  expect(startWeightKg(exercise("bench_press"), GYM, "male")).toBe(20);
  // Safe is 10, but the lightest bar is 20.
  expect(startWeightKg(exercise("bench_press"), GYM, "female")).toBe(20);
  // Safe is a pair of 3, the dumbbells go by 2.
  expect(startWeightKg(exercise("dumbbell_bench_press"), GYM, "female")).toBe(
    4,
  );
  expect(startWeightKg(exercise("lat_pulldown_wide"), GYM, "male")).toBe(5);
  // The most help an assisting machine gives.
  expect(startWeightKg(exercise("assisted_pull_up_wide"), GYM, "male")).toBe(
    80,
  );
  expect(startWeightKg(exercise("leg_press_plates"), GYM, "male")).toBe(0);
});

test("weight finding follows the ratings and stops on a fitting set", () => {
  const result = recommend("bench_press", [
    done(20, 8, "light"),
    done(40, 8, "easy"),
    done(50, 8, "normal"),
    draft,
  ]);

  expect(result.map((r) => r.weight)).toEqual([20, 40, 50, 50]);
  expect(result.map((r) => r.isFinding)).toEqual([true, true, true, false]);
});

test("a light set adds no more than 20 kg", () => {
  const [, next] = recommend("bench_press", [done(60, 8, "light"), draft]);
  expect(next).toMatchObject({ weight: 80, reason: "light" });
});

test("a set below the range settles between it and the last good one", () => {
  const result = recommend("bench_press", [
    done(40, 8, "easy"),
    done(50, 4),
    draft,
  ]);
  expect(result[2]).toMatchObject({
    weight: 45,
    isFinding: false,
    reason: "below",
  });

  // Nothing lighter than the bar.
  const [, alone] = recommend("bench_press", [done(20, 4), draft]);
  expect(alone.weight).toBe(20);
});

test("sets after an entered weight repeat it until it is done", () => {
  const [, next] = recommend("bench_press", [{ ...draft, weight: 60 }, draft]);
  expect(next.weight).toBe(60);
});

test("without a rating the weight stays and finding goes on", () => {
  const [, next] = recommend("bench_press", [done(40, 8), draft]);
  expect(next).toMatchObject({ weight: 40, isFinding: true });
});

test("asking for less ends finding halfway to the last weight that went", () => {
  const [, , next] = recommend("bench_press", [
    done(40, 8, "easy"),
    done(50, 8, "failure"),
    draft,
  ]);
  expect(next).toMatchObject({ weight: 45, isFinding: false, reason: "below" });
});

test("an empty plate-loaded machine is scaled with its hidden weight", () => {
  const [, next] = recommend("leg_press_plates", [done(0, 12, "light"), draft]);
  expect(next.weight).toBe(20);
});

test("finding stops raising at the heaviest weight of the stack", () => {
  const [, next] = recommend("lat_pulldown_wide", [
    done(100, 12, "light"),
    draft,
  ]);
  expect(next).toMatchObject({ weight: 100, reason: "max" });
});

test("after finding the last weight repeats in the next workout", () => {
  const result = buildRecommendations({
    currentSets: [draft, draft],
    previousSets: [
      { type: "working", weight: 40, reps: 8, effort: "easy" },
      { type: "working", weight: 50, reps: 8, effort: "normal" },
      { type: "working", weight: 52.5, reps: 7 },
    ],
    exercise: exercise("bench_press"),
    gym: GYM,
    reps: { min: 6, max: 8 },
    sex: "male",
    selfWeight: 80,
    isFirstOfMovement: false,
  });

  expect(result.map((r) => r.weight)).toEqual([52.5, 52.5]);
  expect(result.every((r) => !r.isFinding)).toBe(true);
});

test("warm-up is two sets from the full weight, lighter ones drop out", () => {
  const warmUps = (id: string, workingWeight: number, isFirst = true) =>
    planWarmUps({
      exercise: exercise(id),
      gym: GYM,
      selfWeight: 80,
      workingWeight,
      isFirstOfMovement: isFirst,
    }).map((w) => [w.weight, w.reps.max]);

  expect(warmUps("bench_press", 60)).toEqual([
    [30, 12],
    [50, 6],
  ]);
  expect(warmUps("bench_press", 30)).toEqual([[25, 6]]);
  expect(warmUps("bench_press", 20)).toEqual([]);
  expect(warmUps("bench_press", 60, false)).toEqual([]);
  // 10 kg of plates is 30 kg with the sled.
  expect(warmUps("leg_press_plates", 10)).toEqual([[5, 6]]);

  const unknown = planWarmUps({
    exercise: exercise("bench_press"),
    gym: defaultGym("user"),
    selfWeight: 80,
    workingWeight: 60,
    isFirstOfMovement: true,
  });
  expect(unknown).toEqual([]);
});

test("warm-up stays on the bar of the working weight", () => {
  const warmUps = planWarmUps({
    exercise: exercise("bench_press"),
    gym: { ...GYM, bars: { units: "kg", items: [20, 10] } },
    selfWeight: 80,
    workingWeight: 20,
    isFirstOfMovement: true,
  });
  expect(warmUps).toEqual([]);
});

test("warm-up sets follow the first working weight", () => {
  const warmUp: SetData = { ...draft, type: "warm-up" };
  const result = recommend(
    "bench_press",
    [warmUp, warmUp, { ...draft, weight: 100 }],
    { isFirstOfMovement: true },
  );
  expect(result.slice(0, 2).map((r) => r.weight)).toEqual([50, 85]);
});
