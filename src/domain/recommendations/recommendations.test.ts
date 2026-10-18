import type { PerformanceWeights } from "../../db";
import { buildRecommendations } from "./recommendations.ts";
import { computeRepRange, computeWorkingWeight } from "./working.ts";
import type { CompletedSetData, DraftSetData } from "./types.ts";

const range = { min: 6, max: 8 };

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

describe("working weight", () => {
  const ten = { min: 10, max: 12 };
  const weight = (...sets: CompletedSetData[]) =>
    computeWorkingWeight(sets, ten, {});

  test.each([
    [[working(40, 12), working(40, 10), working(40, 10)], 40],
    [[working(50, 10), working(40, 12), working(40, 10)], 40],
    [[working(40, 12), working(40, 12), working(50, 12)], 50],
    [[working(50, 15), working(40, 15), working(40, 15)], 40],
  ])("is the weight of the last set: %j", (sets, expected) => {
    expect(weight(...sets)).toBe(expected);
  });

  test("leaves out warm-ups", () => {
    const warmUp: CompletedSetData = { type: "warm-up", weight: 60, reps: 12 };
    expect(weight(working(40, 10), warmUp)).toBe(40);
  });

  test("is unknown without working sets", () => {
    expect(weight()).toBeUndefined();
  });
});

describe("back to the range", () => {
  const ten = { min: 10, max: 12 };

  test.each([
    [[working(40, 12), working(40, 10), working(40, 8)], 37.5],
    [[working(40, 8), working(40, 7)], 35],
    [[working(40, 12), working(40, 12), working(50, 6)], 45],
  ])("gives the bottom of the range by 1RM: %j", (sets, expected) => {
    expect(computeWorkingWeight(sets, ten, {})).toBe(expected);
  });

  test("ignores short sets before the last one", () => {
    expect(
      computeWorkingWeight([working(40, 6), working(40, 10)], ten, {}),
    ).toBe(40);
  });

  test("stops at the lightest weight of the inventory", () => {
    expect(
      computeWorkingWeight([working(20, 12), working(20, 5)], ten, {
        performanceWeights: barbell,
      }),
    ).toBe(20);
  });

  test("adds help on an assisting machine", () => {
    expect(
      computeWorkingWeight([working(25, 8)], ten, {
        exerciseWeights: { type: "negative", selfWeightPercent: 100 },
        selfWeight: 80,
      }),
    ).toBe(30);
  });

  test("is unknown without the weight of the body", () => {
    expect(
      computeWorkingWeight([working(25, 8)], ten, {
        exerciseWeights: { type: "negative", selfWeightPercent: 100 },
      }),
    ).toBeUndefined();
  });
});

describe("weight increase", () => {
  test("steps up the inventory when every set reached the top", () => {
    const sets = [working(80, 8), working(80, 8), working(80, 8)];
    expect(
      computeWorkingWeight(sets, range, { performanceWeights: barbell }),
    ).toBe(82.5);
  });

  test("waits while a set is below the top", () => {
    const sets = [working(80, 8), working(80, 7), working(80, 8)];
    expect(computeWorkingWeight(sets, range, {})).toBe(80);
  });

  test("waits while a set was done with another weight", () => {
    const sets = [working(70, 8), working(80, 8), working(80, 8)];
    expect(computeWorkingWeight(sets, range, {})).toBe(80);
  });

  test("takes help away on an assisting machine", () => {
    const sets = [working(25, 8), working(25, 8)];
    expect(
      computeWorkingWeight(sets, range, {
        exerciseWeights: { type: "negative", selfWeightPercent: 100 },
        selfWeight: 80,
      }),
    ).toBe(22.5);
  });

  test("has nowhere to go without help left", () => {
    const sets = [working(0, 8), working(0, 8)];
    expect(
      computeWorkingWeight(sets, range, {
        exerciseWeights: { type: "negative", selfWeightPercent: 100 },
        selfWeight: 80,
      }),
    ).toBe(0);
  });

  test("waits for the top of the widened range", () => {
    const sets = [working(20, 8), working(20, 8)];
    expect(computeWorkingWeight(sets, range, {})).toBe(20);
  });

  test("raises once the widened top is reached", () => {
    const sets = [working(20, 12), working(20, 12)];
    expect(computeWorkingWeight(sets, range, {})).toBe(22.5);
  });
});

describe("rep range", () => {
  test("reaches the bottom of the next weight by 1RM", () => {
    expect(computeRepRange(20, range, {})).toEqual({ min: 6, max: 12 });
  });

  test("never narrows the range of the exercise", () => {
    const wide = { min: 8, max: 12 };
    expect(computeRepRange(100, wide, { performanceWeights: barbell })).toEqual(
      wide,
    );
  });

  test("stops at 20 reps", () => {
    expect(computeRepRange(1, range, {})).toEqual({ min: 6, max: 20 });
  });

  test("keeps the range without the weight of the body", () => {
    const assisting = { type: "negative", selfWeightPercent: 100 } as const;
    expect(computeRepRange(25, range, { exerciseWeights: assisting })).toEqual(
      range,
    );
  });
});

describe("placeholders", () => {
  const recommend = (currentSets: DraftSetData[]) =>
    buildRecommendations({
      currentSets,
      previousSets: [working(80, 8), working(80, 8)],
      exerciseReps: range,
    }).map((r) => r.weight);

  test("start with the working weight", () => {
    expect(recommend([draft(), draft()])).toEqual([82.5, 82.5]);
  });

  test("give each working set the range of its weight", () => {
    const sets = buildRecommendations({
      currentSets: [draft(), draft(20)],
      previousSets: [working(20, 12)],
      exerciseReps: range,
    });
    expect(sets.map((r) => r.reps)).toEqual([
      { min: 6, max: 10 },
      { min: 6, max: 12 },
    ]);
  });

  test("repeat the weight of the set above", () => {
    expect(
      recommend([draft(82.5), draft(), draft(), draft(77.5), draft()]),
    ).toEqual([82.5, 82.5, 82.5, 82.5, 77.5]);
  });

  test("repeat the weight above after a short set", () => {
    const short: DraftSetData = { type: "working", weight: 75, reps: 3 };
    expect(recommend([short, draft()])).toEqual([82.5, 75]);
  });
});
