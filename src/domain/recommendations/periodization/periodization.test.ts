import type {
  ExerciseWeight,
  PerformanceWeights,
  PeriodizationData,
} from "../../../db";
import type { DraftSetData, RecSetData } from "../types.ts";
import { buildRecommendations, selectMode } from "./periodization.ts";

const _ = undefined;

const plates: PerformanceWeights = {
  units: "kg",
  count: 2,
  additional: 0,
  steps: 1.25,
  base: 0,
};

const machine: PerformanceWeights = {
  units: "kg",
  count: 1,
  additional: 0,
  steps: 5,
  base: 0,
};

const positive: ExerciseWeight = {
  type: "positive",
  selfWeightPercent: 100,
};

const light: PeriodizationData = {
  counter: 0,
  light: 1,
  medium: 0,
  heavy: 0,
};

const medium: PeriodizationData = {
  counter: 0,
  light: 0,
  medium: 1,
  heavy: 0,
};

const heavy: PeriodizationData = {
  counter: 0,
  light: 0,
  medium: 0,
  heavy: 1,
};

function testRecommendations({
  weights,
  curr,
  recs,
  selfWeight,
  exercise,
  progression,
  periodization,
  oneRepMax,
}: {
  weights: PerformanceWeights;
  curr: DraftSetData[];
  recs: RecSetData[];
  selfWeight?: number;
  exercise?: ExerciseWeight;
  progression?: number;
  periodization: PeriodizationData;
  oneRepMax: number;
}) {
  const rec = buildRecommendations({
    prevSets: [],
    currentSets: curr,
    performanceWeights: weights,
    exerciseWeights: exercise,
    selfWeight,
    progression,
    periodization,
    oneRepMax,
  });
  expect(rec).toEqual(recs);
}

describe("heavy weights", () => {
  test("heavy mode", () => {
    testRecommendations({
      oneRepMax: 150,
      periodization: heavy,
      weights: plates,
      curr: [{ type: "working", weight: _, reps: _ }],
      recs: [{ type: "working", weight: 127.5, reps: { min: 4, max: 6 } }],
    });
  });

  test("medium mode", () => {
    testRecommendations({
      oneRepMax: 150,
      periodization: medium,
      weights: plates,
      curr: [{ type: "working", weight: _, reps: _ }],
      recs: [{ type: "working", weight: 112.5, reps: { min: 6, max: 8 } }],
    });
  });

  test("light mode", () => {
    testRecommendations({
      oneRepMax: 150,
      periodization: light,
      weights: plates,
      curr: [{ type: "working", weight: _, reps: _ }],
      recs: [{ type: "working", weight: 97.5, reps: { min: 10, max: 12 } }],
    });
  });
});

describe("medium weights", () => {
  test("heavy mode", () => {
    testRecommendations({
      oneRepMax: 70,
      periodization: heavy,
      weights: plates,
      curr: [{ type: "working", weight: _, reps: _ }],
      recs: [{ type: "working", weight: 57.5, reps: { min: 5, max: 7 } }],
    });
  });

  test("medium mode", () => {
    testRecommendations({
      oneRepMax: 70,
      periodization: medium,
      weights: plates,
      curr: [{ type: "working", weight: _, reps: _ }],
      recs: [{ type: "working", weight: 52.5, reps: { min: 6, max: 8 } }],
    });
  });

  test("light mode", () => {
    testRecommendations({
      oneRepMax: 70,
      periodization: light,
      weights: plates,
      curr: [{ type: "working", weight: _, reps: _ }],
      recs: [{ type: "working", weight: 45, reps: { min: 10, max: 12 } }],
    });
  });
});

describe("small weights", () => {
  test("heavy mode", () => {
    testRecommendations({
      oneRepMax: 12,
      periodization: heavy,
      weights: machine,
      curr: [{ type: "working", weight: _, reps: _ }],
      recs: [{ type: "working", weight: 10, reps: { min: 5, max: 7 } }],
    });
  });

  test("medium mode", () => {
    testRecommendations({
      oneRepMax: 12,
      periodization: medium,
      weights: machine,
      curr: [{ type: "working", weight: _, reps: _ }],
      recs: [{ type: "working", weight: 5, reps: { min: 35, max: 38 } }],
    });
  });

  test("light mode", () => {
    testRecommendations({
      oneRepMax: 12,
      periodization: light,
      weights: machine,
      curr: [{ type: "working", weight: _, reps: _ }],
      recs: [{ type: "working", weight: 5, reps: { min: 32, max: 36 } }],
    });
  });
});

describe("positive weights", () => {
  test("heavy mode", () => {
    testRecommendations({
      oneRepMax: 24,
      selfWeight: 80,
      exercise: positive,
      periodization: heavy,
      weights: plates,
      curr: [{ type: "working", weight: _, reps: _ }],
      recs: [{ type: "working", weight: 20, reps: { min: 5, max: 7 } }],
    });
  });

  test("medium mode", () => {
    testRecommendations({
      oneRepMax: 24,
      selfWeight: 80,
      exercise: positive,
      periodization: medium,
      weights: plates,
      curr: [{ type: "working", weight: _, reps: _ }],
      recs: [{ type: "working", weight: 10, reps: { min: 6, max: 8 } }],
    });
  });

  test("light mode", () => {
    testRecommendations({
      oneRepMax: 24,
      selfWeight: 80,
      exercise: positive,
      periodization: light,
      weights: plates,
      curr: [{ type: "working", weight: _, reps: _ }],
      recs: [{ type: "working", weight: 0, reps: { min: 9, max: 11 } }],
    });
  });
});

test("multiple sets", () => {
  testRecommendations({
    oneRepMax: 150,
    periodization: heavy,
    weights: plates,
    curr: [
      { type: "warm-up", weight: _, reps: _ },
      { type: "warm-up", weight: _, reps: _ },
      { type: "working", weight: _, reps: _ },
      { type: "working", weight: _, reps: _ },
      { type: "working", weight: _, reps: _ },
    ],
    recs: [
      { type: "warm-up", weight: 65, reps: { min: 12, max: 12 } },
      { type: "warm-up", weight: 95, reps: { min: 6, max: 6 } },
      { type: "working", weight: 127.5, reps: { min: 4, max: 6 } },
      { type: "working", weight: 127.5, reps: { min: 4, max: 6 } },
      { type: "working", weight: 127.5, reps: { min: 4, max: 6 } },
    ],
  });
});

test("periodization selector", () => {
  expect(selectMode(light)).toEqual("light");
  expect(selectMode(medium)).toEqual("medium");
  expect(selectMode(heavy)).toEqual("heavy");

  const periodization: PeriodizationData = {
    light: 2,
    medium: 2,
    heavy: 1,
    counter: 0,
  };

  expect(selectMode({ ...periodization, counter: 0 })).toEqual("light");
  expect(selectMode({ ...periodization, counter: 1 })).toEqual("light");
  expect(selectMode({ ...periodization, counter: 2 })).toEqual("medium");
  expect(selectMode({ ...periodization, counter: 3 })).toEqual("medium");
  expect(selectMode({ ...periodization, counter: 4 })).toEqual("heavy");
  expect(selectMode({ ...periodization, counter: 5 })).toEqual("light");
  expect(selectMode({ ...periodization, counter: 14 })).toEqual("heavy");
  expect(selectMode({ ...periodization, counter: 15 })).toEqual("light");
  expect(selectMode({ ...periodization, counter: 16 })).toEqual("light");
});
