import { buildRecommendations } from "./utils.ts";
import { describe } from "vitest";
import type { SetData } from "./types.ts";
import type { PerformanceWeights } from "../../../../db/performances.ts";
import type { ExerciseWeight } from "../../../../db/exercises.ts";

const roundedWeights: PerformanceWeights = {
  units: "kg",
  count: 1,
  additional: 0,
  steps: 1,
  base: 0,
};

const plateWeights: PerformanceWeights = {
  units: "kg",
  count: 2,
  additional: 0,
  steps: 1.25,
  base: 0,
};

const positiveExerciseWeights: ExerciseWeight = {
  type: "positive",
  selfWeightPercent: 50,
};

const negativeExerciseWeights: ExerciseWeight = {
  type: "negative",
  selfWeightPercent: 100,
};

function testRecommendations({
  weights,
  prev,
  curr,
  recs,
  selfWeight,
  exercise,
}: {
  weights?: PerformanceWeights;
  prev: SetData[];
  curr: SetData[];
  recs: SetData[];
  selfWeight?: number;
  exercise?: ExerciseWeight;
}) {
  const rec = buildRecommendations({
    prevSets: prev,
    currentSets: curr,
    performanceWeights: weights ?? roundedWeights,
    exerciseWeights: exercise,
    selfWeight,
  });
  expect(rec).toEqual(recs);
}

describe("no sets", () => {
  test("no recommendations", () => {
    testRecommendations({
      prev: [],
      curr: [],
      recs: [],
    });
  });
});

describe("warm up sets", () => {
  test("no previous set, current set is not filled -> no recommendation", () => {
    testRecommendations({
      prev: [],
      curr: [{ type: "warm-up", weight: 0, reps: 0 }],
      recs: [{ type: "warm-up", weight: 0, reps: 0 }],
    });
  });

  test("no previous set, current weight is filled -> no recommendation", () => {
    testRecommendations({
      prev: [],
      curr: [{ type: "warm-up", weight: 0, reps: 0 }],
      recs: [{ type: "warm-up", weight: 0, reps: 0 }],
    });
  });

  test("no previous set, current reps is filled -> no recommendation", () => {
    testRecommendations({
      prev: [],
      curr: [{ type: "warm-up", weight: 0, reps: 30 }],
      recs: [{ type: "warm-up", weight: 0, reps: 0 }],
    });
  });

  test("no previous warm-up set, 1 current warm-up set is not filled -> 1 set recommendation", () => {
    testRecommendations({
      weights: plateWeights,
      prev: [{ type: "working", weight: 100, reps: 8 }],
      curr: [{ type: "warm-up", weight: 0, reps: 0 }],
      recs: [{ type: "warm-up", weight: 60, reps: 12 }],
    });
  });

  test("no previous warm-up set, 2 current warm-up set is not filled -> 2 set recommendation", () => {
    testRecommendations({
      weights: plateWeights,
      prev: [{ type: "working", weight: 100, reps: 8 }],
      curr: [
        { type: "warm-up", weight: 0, reps: 0 },
        { type: "warm-up", weight: 0, reps: 0 },
      ],
      recs: [
        { type: "warm-up", weight: 50, reps: 12 },
        { type: "warm-up", weight: 75, reps: 6 },
      ],
    });
  });

  test("no previous warm-up set, 3 current warm-up set is not filled -> 3 set recommendation", () => {
    testRecommendations({
      weights: plateWeights,
      prev: [{ type: "working", weight: 100, reps: 8 }],
      curr: [
        { type: "warm-up", weight: 0, reps: 0 },
        { type: "warm-up", weight: 0, reps: 0 },
        { type: "warm-up", weight: 0, reps: 0 },
      ],
      recs: [
        { type: "warm-up", weight: 40, reps: 15 },
        { type: "warm-up", weight: 60, reps: 8 },
        { type: "warm-up", weight: 80, reps: 4 },
      ],
    });
  });

  test("no previous warm-up set, 4 current warm-up set is not filled -> 4 set recommendation", () => {
    testRecommendations({
      weights: plateWeights,
      prev: [{ type: "working", weight: 100, reps: 8 }],
      curr: [
        { type: "warm-up", weight: 0, reps: 0 },
        { type: "warm-up", weight: 0, reps: 0 },
        { type: "warm-up", weight: 0, reps: 0 },
        { type: "warm-up", weight: 0, reps: 0 },
      ],
      recs: [
        { type: "warm-up", weight: 30, reps: 15 },
        { type: "warm-up", weight: 50, reps: 10 },
        { type: "warm-up", weight: 70, reps: 6 },
        { type: "warm-up", weight: 85, reps: 2 },
      ],
    });
  });

  test("no previous warm-up set, current reps is filled -> no recommendation", () => {
    testRecommendations({
      prev: [{ type: "working", weight: 50, reps: 8 }],
      curr: [{ type: "warm-up", weight: 0, reps: 30 }],
      recs: [{ type: "warm-up", weight: 0, reps: 0 }],
    });
  });

  test("no previous warm-up set, current weight is filled -> no recommendation", () => {
    testRecommendations({
      prev: [{ type: "working", weight: 50, reps: 8 }],
      curr: [{ type: "warm-up", weight: 30, reps: 0 }],
      recs: [{ type: "warm-up", weight: 0, reps: 0 }],
    });
  });

  test("previous warm-up is filled, current is not filled -> standard recommendation", () => {
    testRecommendations({
      weights: plateWeights,
      prev: [
        { type: "warm-up", weight: 20, reps: 20 },
        { type: "working", weight: 100, reps: 8 },
      ],
      curr: [{ type: "warm-up", weight: 0, reps: 0 }],
      recs: [{ type: "warm-up", weight: 60, reps: 12 }],
    });
  });

  test("multiple current warm-up sets, current is not filled -> standard recommendations", () => {
    testRecommendations({
      weights: plateWeights,
      prev: [
        { type: "warm-up", weight: 10, reps: 30 },
        { type: "working", weight: 50, reps: 8 },
      ],
      curr: [
        { type: "warm-up", weight: 0, reps: 0 },
        { type: "warm-up", weight: 0, reps: 0 },
      ],
      recs: [
        { type: "warm-up", weight: 25, reps: 12 },
        { type: "warm-up", weight: 37.5, reps: 6 },
      ],
    });
  });
});

describe("single working set", () => {
  test("current set is filled -> use filled values", () => {
    testRecommendations({
      weights: plateWeights,
      prev: [{ type: "working", weight: 30, reps: 8 }],
      curr: [{ type: "working", weight: 27.5, reps: 20 }],
      recs: [{ type: "working", weight: 27.5, reps: 20 }],
    });
  });

  test("no previous set, weight filled -> use filled values", () => {
    testRecommendations({
      weights: plateWeights,
      prev: [],
      curr: [{ type: "working", weight: 27.5, reps: 0 }],
      recs: [{ type: "working", weight: 27.5, reps: 0 }],
    });
  });

  test("no previous set, reps filled -> use filled values", () => {
    testRecommendations({
      prev: [],
      curr: [{ type: "working", weight: 0, reps: 20 }],
      recs: [{ type: "working", weight: 0, reps: 20 }],
    });
  });

  test("no previous set, current set filled -> use filled values", () => {
    testRecommendations({
      weights: plateWeights,
      prev: [],
      curr: [{ type: "working", weight: 27.5, reps: 20 }],
      recs: [{ type: "working", weight: 27.5, reps: 20 }],
    });
  });

  test("no previous set, current set is not filled -> no recommendation", () => {
    testRecommendations({
      prev: [],
      curr: [{ type: "working", weight: 0, reps: 0 }],
      recs: [{ type: "working", weight: 0, reps: 0 }],
    });
  });

  test("previous reps is small, current set is not filled -> increase reps", () => {
    testRecommendations({
      weights: plateWeights,
      prev: [{ type: "working", weight: 32.5, reps: 8 }],
      curr: [{ type: "working", weight: 0, reps: 0 }],
      recs: [{ type: "working", weight: 32.5, reps: 10 }],
    });
  });

  test("previous reps is very small, current set is not filled -> increase reps", () => {
    testRecommendations({
      prev: [{ type: "working", weight: 30, reps: 1 }],
      curr: [{ type: "working", weight: 0, reps: 0 }],
      recs: [{ type: "working", weight: 30, reps: 3 }],
    });
  });

  test("previous reps is maxed out, current set is not filled -> increase weight", () => {
    testRecommendations({
      prev: [{ type: "working", weight: 30, reps: 12 }],
      curr: [{ type: "working", weight: 0, reps: 0 }],
      recs: [{ type: "working", weight: 33, reps: 8 }],
    });
  });

  test("previous reps is maxed out, weight is too small, current set is not filled -> increase reps", () => {
    testRecommendations({
      weights: roundedWeights,
      prev: [{ type: "working", weight: 3, reps: 12 }],
      curr: [{ type: "working", weight: 0, reps: 0 }],
      recs: [{ type: "working", weight: 3, reps: 14 }],
    });
  });

  test("previous reps is maxed out, weight is small, current set is not filled -> extra low reps", () => {
    testRecommendations({
      weights: plateWeights,
      prev: [{ type: "working", weight: 10, reps: 12 }],
      curr: [{ type: "working", weight: 0, reps: 0 }],
      recs: [{ type: "working", weight: 12.5, reps: 6 }],
    });
  });

  test("current weight equals previous weight -> recommend more reps", () => {
    testRecommendations({
      weights: plateWeights,
      prev: [{ type: "working", weight: 12.5, reps: 12 }],
      curr: [{ type: "working", weight: 12.5, reps: 0 }],
      recs: [{ type: "working", weight: 12.5, reps: 14 }],
    });
  });

  test("current weight greater than previous weight -> recommend less reps", () => {
    testRecommendations({
      weights: plateWeights,
      prev: [{ type: "working", weight: 10, reps: 12 }],
      curr: [{ type: "working", weight: 12.5, reps: 0 }],
      recs: [{ type: "working", weight: 12.5, reps: 4 }],
    });
  });

  test("current weight less than previous weight -> recommend more reps", () => {
    testRecommendations({
      weights: plateWeights,
      prev: [{ type: "working", weight: 10, reps: 8 }],
      curr: [{ type: "working", weight: 7.5, reps: 0 }],
      recs: [{ type: "working", weight: 7.5, reps: 21 }],
    });
  });

  test("current reps is filled -> compute equivalent 1RM weight", () => {
    testRecommendations({
      prev: [{ type: "working", weight: 50, reps: 8 }],
      curr: [{ type: "working", weight: 0, reps: 16 }],
      recs: [{ type: "working", weight: 41, reps: 16 }],
    });
  });

  test("previous reps is almost maxed out -> increase to max reps", () => {
    testRecommendations({
      prev: [{ type: "working", weight: 50, reps: 11 }],
      curr: [{ type: "working", weight: 0, reps: 0 }],
      recs: [{ type: "working", weight: 50, reps: 12 }],
    });
  });
});

describe("multiple working sets", () => {
  test("some sets are filled, next sets are not filled -> duplicate filled set to next sets", () => {
    testRecommendations({
      prev: [{ type: "working", weight: 50, reps: 8 }],
      curr: [
        { type: "working", weight: 30, reps: 12 },
        { type: "working", weight: 0, reps: 0 },
        { type: "working", weight: 35, reps: 8 },
        { type: "working", weight: 0, reps: 0 },
      ],
      recs: [
        { type: "working", weight: 30, reps: 12 },
        { type: "working", weight: 30, reps: 12 },
        { type: "working", weight: 35, reps: 8 },
        { type: "working", weight: 35, reps: 8 },
      ],
    });
  });

  test("some sets are filled, next weight is filled -> use recommendations for next set", () => {
    testRecommendations({
      prev: [{ type: "working", weight: 50, reps: 8 }],
      curr: [
        { type: "working", weight: 50, reps: 12 },
        { type: "working", weight: 50, reps: 0 },
        { type: "working", weight: 0, reps: 0 },
        { type: "working", weight: 0, reps: 0 },
      ],
      recs: [
        { type: "working", weight: 50, reps: 12 },
        { type: "working", weight: 50, reps: 10 },
        { type: "working", weight: 50, reps: 10 },
        { type: "working", weight: 50, reps: 10 },
      ],
    });
  });

  test("some sets are filled, next reps is filled -> use recommendations for next set", () => {
    testRecommendations({
      prev: [{ type: "working", weight: 50, reps: 8 }],
      curr: [
        { type: "working", weight: 50, reps: 12 },
        { type: "working", weight: 0, reps: 15 },
        { type: "working", weight: 0, reps: 0 },
        { type: "working", weight: 0, reps: 0 },
      ],
      recs: [
        { type: "working", weight: 50, reps: 12 },
        { type: "working", weight: 42, reps: 15 },
        { type: "working", weight: 42, reps: 15 },
        { type: "working", weight: 42, reps: 15 },
      ],
    });
  });
});

describe("positive exercise weight", () => {
  test("weight is zero, previous reps is small, current set is not filled -> increase reps", () => {
    testRecommendations({
      weights: plateWeights,
      exercise: positiveExerciseWeights,
      selfWeight: 60,
      prev: [{ type: "working", weight: 0, reps: 8 }],
      curr: [{ type: "working", weight: 0, reps: 0 }],
      recs: [{ type: "working", weight: 0, reps: 10 }],
    });
  });

  test("previous reps is small, current set is not filled -> increase reps", () => {
    testRecommendations({
      weights: plateWeights,
      exercise: positiveExerciseWeights,
      selfWeight: 60,
      prev: [{ type: "working", weight: 20, reps: 8 }],
      curr: [{ type: "working", weight: 0, reps: 0 }],
      recs: [{ type: "working", weight: 20, reps: 10 }],
    });
  });

  test("previous reps is very small, current set is not filled -> increase reps", () => {
    testRecommendations({
      exercise: positiveExerciseWeights,
      selfWeight: 60,
      prev: [{ type: "working", weight: 30, reps: 1 }],
      curr: [{ type: "working", weight: 0, reps: 0 }],
      recs: [{ type: "working", weight: 30, reps: 3 }],
    });
  });

  test("previous reps is maxed out, current set is not filled -> increase weight", () => {
    testRecommendations({
      exercise: positiveExerciseWeights,
      selfWeight: 60,
      prev: [{ type: "working", weight: 30, reps: 12 }],
      curr: [{ type: "working", weight: 0, reps: 0 }],
      recs: [{ type: "working", weight: 36, reps: 8 }],
    });
  });

  test("current weight equals previous weight -> recommend more reps", () => {
    testRecommendations({
      weights: plateWeights,
      exercise: positiveExerciseWeights,
      selfWeight: 60,
      prev: [{ type: "working", weight: 12.5, reps: 12 }],
      curr: [{ type: "working", weight: 12.5, reps: 0 }],
      recs: [{ type: "working", weight: 12.5, reps: 14 }],
    });
  });

  test("current weight greater than previous weight -> recommend less reps", () => {
    testRecommendations({
      weights: plateWeights,
      exercise: positiveExerciseWeights,
      selfWeight: 60,
      prev: [{ type: "working", weight: 10, reps: 12 }],
      curr: [{ type: "working", weight: 12.5, reps: 0 }],
      recs: [{ type: "working", weight: 12.5, reps: 10 }],
    });
  });

  test("current weight less than previous weight -> recommend more reps", () => {
    testRecommendations({
      weights: plateWeights,
      exercise: positiveExerciseWeights,
      selfWeight: 60,
      prev: [{ type: "working", weight: 10, reps: 8 }],
      curr: [{ type: "working", weight: 7.5, reps: 0 }],
      recs: [{ type: "working", weight: 7.5, reps: 11 }],
    });
  });

  test("current reps is filled -> compute equivalent 1RM weight", () => {
    testRecommendations({
      exercise: positiveExerciseWeights,
      selfWeight: 60,
      prev: [{ type: "working", weight: 50, reps: 8 }],
      curr: [{ type: "working", weight: 0, reps: 16 }],
      recs: [{ type: "working", weight: 36, reps: 16 }],
    });
  });

  test("no previous warm-up set, 1 current warm-up set is not filled -> 1 set recommendation", () => {
    testRecommendations({
      weights: plateWeights,
      exercise: positiveExerciseWeights,
      selfWeight: 60,
      prev: [{ type: "working", weight: 40, reps: 8 }],
      curr: [{ type: "warm-up", weight: 0, reps: 0 }],
      recs: [{ type: "warm-up", weight: 12.5, reps: 12 }],
    });
  });
});

describe("negative exercise weight", () => {
  test("weight is zero, previous reps is small, current set is not filled -> increase reps", () => {
    testRecommendations({
      weights: plateWeights,
      exercise: negativeExerciseWeights,
      selfWeight: 60,
      prev: [{ type: "working", weight: 0, reps: 8 }],
      curr: [{ type: "working", weight: 0, reps: 0 }],
      recs: [{ type: "working", weight: 0, reps: 10 }],
    });
  });

  test("previous reps is small, current set is not filled -> increase reps", () => {
    testRecommendations({
      weights: plateWeights,
      exercise: negativeExerciseWeights,
      selfWeight: 60,
      prev: [{ type: "working", weight: 20, reps: 8 }],
      curr: [{ type: "working", weight: 0, reps: 0 }],
      recs: [{ type: "working", weight: 20, reps: 10 }],
    });
  });

  test("previous reps is very small, current set is not filled -> increase reps", () => {
    testRecommendations({
      exercise: negativeExerciseWeights,
      selfWeight: 60,
      prev: [{ type: "working", weight: 30, reps: 1 }],
      curr: [{ type: "working", weight: 0, reps: 0 }],
      recs: [{ type: "working", weight: 30, reps: 3 }],
    });
  });

  test("previous reps is maxed out, current set is not filled -> decrease weight", () => {
    testRecommendations({
      weights: roundedWeights,
      exercise: negativeExerciseWeights,
      selfWeight: 60,
      prev: [{ type: "working", weight: 30, reps: 12 }],
      curr: [{ type: "working", weight: 0, reps: 0 }],
      recs: [{ type: "working", weight: 27, reps: 8 }],
    });
  });

  test("current weight equals previous weight -> recommend more reps", () => {
    testRecommendations({
      weights: plateWeights,
      exercise: negativeExerciseWeights,
      selfWeight: 60,
      prev: [{ type: "working", weight: 12.5, reps: 12 }],
      curr: [{ type: "working", weight: 12.5, reps: 0 }],
      recs: [{ type: "working", weight: 12.5, reps: 14 }],
    });
  });

  test("current weight greater than previous weight -> recommend more reps", () => {
    testRecommendations({
      weights: plateWeights,
      exercise: negativeExerciseWeights,
      selfWeight: 60,
      prev: [{ type: "working", weight: 10, reps: 12 }],
      curr: [{ type: "working", weight: 12.5, reps: 0 }],
      recs: [{ type: "working", weight: 12.5, reps: 14 }],
    });
  });

  test("current weight less than previous weight -> recommend less reps", () => {
    testRecommendations({
      weights: plateWeights,
      exercise: negativeExerciseWeights,
      selfWeight: 60,
      prev: [{ type: "working", weight: 10, reps: 8 }],
      curr: [{ type: "working", weight: 7.5, reps: 0 }],
      recs: [{ type: "working", weight: 7.5, reps: 6 }],
    });
  });

  test("current reps is filled -> compute equivalent 1RM weight", () => {
    testRecommendations({
      weights: roundedWeights,
      exercise: negativeExerciseWeights,
      selfWeight: 60,
      prev: [{ type: "working", weight: 20, reps: 8 }],
      curr: [{ type: "working", weight: 0, reps: 16 }],
      recs: [{ type: "working", weight: 27, reps: 16 }],
    });
  });

  test("no previous warm-up set, 1 current warm-up set is not filled -> 1 set recommendation", () => {
    testRecommendations({
      weights: plateWeights,
      exercise: negativeExerciseWeights,
      selfWeight: 60,
      prev: [{ type: "working", weight: 20, reps: 8 }],
      curr: [{ type: "warm-up", weight: 0, reps: 0 }],
      recs: [{ type: "warm-up", weight: 35, reps: 12 }],
    });
  });
});
