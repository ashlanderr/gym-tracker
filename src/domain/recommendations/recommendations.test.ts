import type { PerformanceWeights } from "../../db";
import { buildRecommendations } from "./recommendations.ts";
import {
  computeRepRange,
  computeWeightChange,
  computeWorkingWeight,
} from "./working.ts";
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
    [[working(20, 12), working(40, 12), working(60, 12)], 60],
    [[working(20, 12), working(40, 10), working(60, 4)], 40],
    [[working(40, 12), working(40, 8), working(35, 12), working(35, 10)], 35],
    [[working(40, 12), working(40, 12), working(50, 6)], 40],
    [[working(50, 10), working(40, 12), working(40, 10)], 40],
    [[working(40, 12), working(40, 12), working(50, 12)], 50],
  ])("is the last set that reached the bottom: %j", (sets, expected) => {
    expect(weight(...sets)).toBe(expected);
  });

  test("is the last set when none reached the bottom", () => {
    expect(weight(working(40, 8), working(35, 7))).toBe(35);
  });

  test("leaves out warm-ups", () => {
    const warmUp: CompletedSetData = { type: "warm-up", weight: 60, reps: 12 };
    expect(weight(working(40, 10), warmUp)).toBe(40);
  });
});

describe("weight change", () => {
  const ten = { min: 10, max: 12 };
  const change = (...sets: CompletedSetData[]) =>
    computeWeightChange(sets, ten, {})?.type ?? null;

  test("rolls back when a set with the weight fell below the bottom", () => {
    expect(
      computeWeightChange(
        [working(40, 12), working(40, 10), working(40, 8)],
        ten,
        {},
      ),
    ).toMatchObject({ type: "decrease", from: 40, to: 37.5 });
  });

  test("rolls back when no set reached the bottom", () => {
    expect(change(working(40, 8), working(40, 7))).toBe("decrease");
  });

  test("ignores a short try with another weight", () => {
    expect(change(working(40, 12), working(40, 12), working(50, 6))).toBe(
      "mixed",
    );
  });

  test("follows a rollback of the person", () => {
    expect(
      change(working(40, 12), working(40, 8), working(35, 12), working(35, 10)),
    ).toBe("mixed");
  });

  test("stays silent with one weight in the range", () => {
    expect(change(working(40, 12), working(40, 10), working(40, 10))).toBe(
      null,
    );
  });

  test("never raises after mixed weights", () => {
    expect(change(working(50, 15), working(40, 15), working(40, 15))).toBe(
      "mixed",
    );
  });

  test("has nothing lighter at the empty bar", () => {
    expect(
      computeWeightChange([working(20, 12), working(20, 8)], ten, {
        performanceWeights: barbell,
      }),
    ).toMatchObject({ type: "lightest", weight: 20 });
  });

  test("adds help on an assisting machine", () => {
    expect(
      computeWeightChange([working(25, 8)], ten, {
        exerciseWeights: { type: "negative", selfWeightPercent: 100 },
        selfWeight: 80,
      }),
    ).toMatchObject({ type: "decrease", from: 25, to: 27.5 });
  });
});

describe("story of the last time", () => {
  const ten = { min: 10, max: 12 };
  const read = (...sets: Array<[number, number]>) =>
    computeWeightChange(
      sets.map(([weight, reps]) => working(weight, reps)),
      ten,
      {},
    );

  test("tells where each set went and how it came out", () => {
    expect(
      read([40, 15], [40, 10], [50, 8], [35, 15])?.steps.map(
        (s) => `${s.move} ${s.result}`,
      ),
    ).toEqual(["start top", "same range", "up short", "down top"]);
  });

  test.each([
    [
      [
        [20, 12],
        [40, 12],
        [60, 12],
      ],
      "continue",
    ],
    [
      [
        [20, 12],
        [40, 10],
        [60, 4],
      ],
      "limit",
    ],
    [
      [
        [40, 12],
        [40, 12],
        [50, 6],
      ],
      "limit",
    ],
    [
      [
        [40, 12],
        [40, 12],
        [50, 12],
      ],
      "continue",
    ],
    [
      [
        [40, 12],
        [40, 8],
        [35, 12],
        [35, 10],
      ],
      "back",
    ],
    [
      [
        [50, 10],
        [40, 12],
        [40, 10],
      ],
      "back",
    ],
  ] as Array<[Array<[number, number]>, string]>)(
    "ends with why: %j",
    (sets, reason) => {
      expect(read(...sets)).toMatchObject({ type: "mixed", reason });
    },
  );

  test("is not told when every set had the working weight", () => {
    expect(read([40, 12], [40, 10], [40, 10])).toBeNull();
  });

  test("goes up by the load on an assisting machine", () => {
    const change = computeWeightChange(
      [working(30, 10), working(30, 10), working(25, 10)],
      ten,
      {
        exerciseWeights: { type: "negative", selfWeightPercent: 100 },
        selfWeight: 80,
      },
    );
    expect(change?.steps.at(-1)?.move).toBe("up");
  });
});

describe("weight increase", () => {
  test("steps up the inventory when every set reached the top", () => {
    const sets = [working(80, 8), working(80, 8), working(80, 8)];
    expect(
      computeWeightChange(sets, range, {
        performanceWeights: barbell,
      }),
    ).toMatchObject({ type: "increase", from: 80, to: 82.5, range });
  });

  test("waits while a set is below the top", () => {
    const sets = [working(80, 8), working(80, 7), working(80, 8)];
    expect(computeWeightChange(sets, range, {})).toBeNull();
  });

  test("waits while a set was done with another weight", () => {
    const sets = [working(70, 8), working(80, 8), working(80, 8)];
    expect(computeWeightChange(sets, range, {})?.type).toBe("mixed");
  });

  test("takes help away on an assisting machine", () => {
    const sets = [working(25, 8), working(25, 8)];
    expect(
      computeWeightChange(sets, range, {
        exerciseWeights: { type: "negative", selfWeightPercent: 100 },
        selfWeight: 80,
      }),
    ).toMatchObject({ type: "increase", from: 25, to: 22.5, range });
  });

  test("has nowhere to go without help left", () => {
    const sets = [working(0, 8), working(0, 8)];
    expect(
      computeWeightChange(sets, range, {
        exerciseWeights: { type: "negative", selfWeightPercent: 100 },
        selfWeight: 80,
      }),
    ).toBeNull();
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

describe("increase by the range", () => {
  test("waits for the top of the widened range", () => {
    const sets = [working(20, 8), working(20, 8)];
    expect(computeWeightChange(sets, range, {})).toBeNull();
  });

  test("raises once the widened top is reached", () => {
    const sets = [working(20, 12), working(20, 12)];
    expect(computeWeightChange(sets, range, {})).toMatchObject({
      type: "increase",
      from: 20,
      to: 22.5,
      range: { min: 6, max: 12 },
    });
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

  test("repeat the last weight that reached the range", () => {
    const sets = buildRecommendations({
      currentSets: [draft(), draft()],
      previousSets: [working(85, 6), working(80, 8), working(85, 5)],
      exerciseReps: range,
    });
    expect(sets.map((r) => r.weight)).toEqual([80, 80]);
  });

  test("give each working set the range of its weight", () => {
    const sets = buildRecommendations({
      currentSets: [draft(), draft(22.5)],
      previousSets: [working(20, 12)],
      exerciseReps: range,
    });
    expect(sets.map((r) => r.reps)).toEqual([
      { min: 6, max: 12 },
      { min: 6, max: 10 },
    ]);
  });

  test("repeat the weight of the set above", () => {
    expect(
      recommend([draft(82.5), draft(), draft(), draft(77.5), draft()]),
    ).toEqual([80, 82.5, 82.5, 82.5, 77.5]);
  });
});
