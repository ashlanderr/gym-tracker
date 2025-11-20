import type {
  ExerciseWeight,
  PerformanceWeights,
  PeriodizationData,
  RecordNumbers,
} from "../../../db";
import type { DraftSetData, RecSetData } from "../types.ts";
import {
  buildRecommendations,
  getCurrentPeriodization as getMode,
} from "./periodization.ts";

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

const dumbbells: PerformanceWeights = {
  units: "kg",
  count: 2,
  additional: 0,
  steps: 2,
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
  periodization,
  oneRepMax,
}: {
  weights: PerformanceWeights;
  curr: DraftSetData[];
  recs: RecSetData[];
  selfWeight?: number;
  exercise?: ExerciseWeight;
  periodization: PeriodizationData;
  oneRepMax: number | RecordNumbers;
}) {
  const rec = buildRecommendations({
    currentSets: curr,
    performanceWeights: weights,
    exerciseWeights: exercise,
    exerciseReps: "low",
    selfWeight,
    periodization,
    oneRepMax:
      typeof oneRepMax === "number"
        ? { current: oneRepMax, full: undefined, createdAt: 0 }
        : oneRepMax,
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
      recs: [{ type: "working", weight: 132.5, reps: { min: 4, max: 6 } }],
    });
  });

  test("medium mode", () => {
    testRecommendations({
      oneRepMax: 150,
      periodization: medium,
      weights: plates,
      curr: [{ type: "working", weight: _, reps: _ }],
      recs: [{ type: "working", weight: 110, reps: { min: 6, max: 9 } }],
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
      recs: [{ type: "working", weight: 62.5, reps: { min: 3, max: 6 } }],
    });
  });

  test("medium mode", () => {
    testRecommendations({
      oneRepMax: 70,
      periodization: medium,
      weights: plates,
      curr: [{ type: "working", weight: _, reps: _ }],
      recs: [{ type: "working", weight: 50, reps: { min: 7, max: 10 } }],
    });
  });

  test("light mode", () => {
    testRecommendations({
      oneRepMax: 70,
      periodization: light,
      weights: plates,
      curr: [{ type: "working", weight: _, reps: _ }],
      recs: [{ type: "working", weight: 45, reps: { min: 10, max: 13 } }],
    });
  });
});

describe("small weights", () => {
  test("heavy mode, machine", () => {
    testRecommendations({
      oneRepMax: 11.5,
      periodization: heavy,
      weights: machine,
      curr: [{ type: "working", weight: _, reps: _ }],
      recs: [{ type: "working", weight: 10, reps: { min: 4, max: 7 } }],
    });
  });

  test("heavy mode, dumbbells", () => {
    testRecommendations({
      oneRepMax: 28,
      periodization: heavy,
      weights: dumbbells,
      curr: [{ type: "working", weight: _, reps: _ }],
      recs: [{ type: "working", weight: 24, reps: { min: 5, max: 7 } }],
    });
  });

  test("medium mode", () => {
    testRecommendations({
      oneRepMax: 12,
      periodization: medium,
      weights: machine,
      curr: [{ type: "working", weight: _, reps: _ }],
      recs: [{ type: "working", weight: 5, reps: { min: 33, max: 38 } }],
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
  test("heavy mode, external weight", () => {
    testRecommendations({
      oneRepMax: 24,
      selfWeight: 80,
      exercise: positive,
      periodization: heavy,
      weights: plates,
      curr: [{ type: "working", weight: _, reps: _ }],
      recs: [{ type: "working", weight: 25, reps: { min: 3, max: 6 } }],
    });
  });

  test("heavy mode, full weight", () => {
    testRecommendations({
      oneRepMax: { current: 25.333, full: 126.7, createdAt: 0 },
      selfWeight: 80,
      exercise: positive,
      periodization: heavy,
      weights: plates,
      curr: [{ type: "working", weight: _, reps: _ }],
      recs: [{ type: "working", weight: 32.5, reps: { min: 4, max: 6 } }],
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
      recs: [{ type: "working", weight: 5, reps: { min: 7, max: 9 } }],
    });
  });

  test("light mode", () => {
    testRecommendations({
      oneRepMax: 30,
      selfWeight: 80,
      exercise: positive,
      periodization: light,
      weights: plates,
      curr: [{ type: "working", weight: _, reps: _ }],
      recs: [{ type: "working", weight: 0, reps: { min: 10, max: 12 } }],
    });
  });

  test("light mode, no available weights", () => {
    testRecommendations({
      oneRepMax: 24,
      selfWeight: 80,
      exercise: positive,
      periodization: light,
      weights: plates,
      curr: [{ type: "working", weight: _, reps: _ }],
      recs: [],
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
      { type: "warm-up", weight: 67.5, reps: { min: 12, max: 12 } },
      { type: "warm-up", weight: 100, reps: { min: 6, max: 6 } },
      { type: "working", weight: 132.5, reps: { min: 4, max: 6 } },
      { type: "working", weight: 132.5, reps: { min: 4, max: 6 } },
      { type: "working", weight: 132.5, reps: { min: 4, max: 6 } },
    ],
  });
});

test("periodization selector", () => {
  expect(getMode(light)).toEqual("light");
  expect(getMode(medium)).toEqual("medium");
  expect(getMode(heavy)).toEqual("heavy");

  const periodization: PeriodizationData = {
    light: 2,
    medium: 2,
    heavy: 1,
    counter: 0,
  };

  expect(getMode({ ...periodization, counter: 0 })).toEqual("light");
  expect(getMode({ ...periodization, counter: 1 })).toEqual("light");
  expect(getMode({ ...periodization, counter: 2 })).toEqual("medium");
  expect(getMode({ ...periodization, counter: 3 })).toEqual("medium");
  expect(getMode({ ...periodization, counter: 4 })).toEqual("heavy");
  expect(getMode({ ...periodization, counter: 5 })).toEqual("light");
  expect(getMode({ ...periodization, counter: 14 })).toEqual("heavy");
  expect(getMode({ ...periodization, counter: 15 })).toEqual("light");
  expect(getMode({ ...periodization, counter: 16 })).toEqual("light");
});
