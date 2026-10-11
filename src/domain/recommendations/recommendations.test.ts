import type { PerformanceWeights } from "../../db";
import { buildRecommendations } from "./recommendations.ts";
import { computeWeightIncrease } from "./working.ts";
import type { CompletedSetData, DraftSetData } from "./types.ts";

const range = { min: 6, max: 8 };
const fallbackStepKg = 2.5;

const barbell: PerformanceWeights = {
  units: "kg",
  base: 20,
  steps: [1.25, 2.5, 5, 10, 20],
  count: 2,
};

function working(weight: number, reps: number): CompletedSetData {
  return { type: "working", weight, reps };
}

function draft(weight?: number): DraftSetData {
  return { type: "working", weight, reps: undefined };
}

describe("weight increase", () => {
  test("steps up the inventory when every set reached the top", () => {
    const sets = [working(80, 8), working(80, 8), working(80, 8)];
    expect(
      computeWeightIncrease(sets, range, {
        performanceWeights: barbell,
        fallbackStepKg,
      }),
    ).toEqual({ from: 80, to: 82.5 });
  });

  test("waits while a set is below the top", () => {
    const sets = [working(80, 8), working(80, 7), working(80, 8)];
    expect(computeWeightIncrease(sets, range, { fallbackStepKg })).toBeNull();
  });

  test("starts from the heaviest set", () => {
    const sets = [working(75, 8), working(80, 8), working(77.5, 8)];
    expect(computeWeightIncrease(sets, range, { fallbackStepKg })).toEqual({
      from: 80,
      to: 82.5,
    });
  });

  test("takes help away on an assisting machine", () => {
    const sets = [working(30, 8), working(25, 8)];
    expect(
      computeWeightIncrease(sets, range, {
        exerciseWeights: { type: "negative", selfWeightPercent: 100 },
        selfWeight: 80,
        fallbackStepKg,
      }),
    ).toEqual({ from: 25, to: 22.5 });
  });

  test("has nowhere to go without help left", () => {
    const sets = [working(0, 8), working(0, 8)];
    expect(
      computeWeightIncrease(sets, range, {
        exerciseWeights: { type: "negative", selfWeightPercent: 100 },
        selfWeight: 80,
        fallbackStepKg,
      }),
    ).toBeNull();
  });
});

describe("placeholders", () => {
  const recommend = (currentSets: DraftSetData[]) =>
    buildRecommendations({
      currentSets,
      previousSets: [working(80, 8), working(80, 8)],
      exerciseReps: range,
    }).map((r) => r.weight);

  test("repeat the last time without raising it", () => {
    expect(recommend([draft(), draft()])).toEqual([80, 80]);
  });

  test("repeat the weight of the set above", () => {
    expect(
      recommend([draft(82.5), draft(), draft(), draft(77.5), draft()]),
    ).toEqual([80, 82.5, 82.5, 82.5, 77.5]);
  });
});
