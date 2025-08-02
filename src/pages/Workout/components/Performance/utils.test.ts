import { buildRecommendations } from "./utils.ts";
import { describe } from "vitest";
import type { SetData } from "./types.ts";

function testRecommendations({
  prev,
  curr,
  recs,
}: {
  prev: SetData[];
  curr: SetData[];
  recs: SetData[];
}) {
  const rec = buildRecommendations(prev, curr);
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

  test("no previous set, current weight is filled -> use filled values", () => {
    testRecommendations({
      prev: [],
      curr: [{ type: "warm-up", weight: 20, reps: 0 }],
      recs: [{ type: "warm-up", weight: 20, reps: 0 }],
    });
  });

  test("no previous set, current reps is filled -> use filled values", () => {
    testRecommendations({
      prev: [],
      curr: [{ type: "warm-up", weight: 0, reps: 30 }],
      recs: [{ type: "warm-up", weight: 0, reps: 30 }],
    });
  });

  test("no previous warm-up set, current set is not filled -> no recommendation", () => {
    testRecommendations({
      prev: [{ type: "working", weight: 50, reps: 8 }],
      curr: [{ type: "warm-up", weight: 0, reps: 0 }],
      recs: [{ type: "warm-up", weight: 0, reps: 0 }],
    });
  });

  test("no previous warm-up set, current reps is filled -> weight recommendation", () => {
    testRecommendations({
      prev: [{ type: "working", weight: 50, reps: 8 }],
      curr: [{ type: "warm-up", weight: 0, reps: 30 }],
      recs: [{ type: "warm-up", weight: 25, reps: 30 }],
    });
  });

  test("no previous warm-up set, current weight is filled -> reps recommendation", () => {
    testRecommendations({
      prev: [{ type: "working", weight: 50, reps: 8 }],
      curr: [{ type: "warm-up", weight: 30, reps: 0 }],
      recs: [{ type: "warm-up", weight: 30, reps: 21 }],
    });
  });

  test("previous warm-up is filled, current is not filled -> same reps, weight recommendation", () => {
    testRecommendations({
      prev: [
        { type: "warm-up", weight: 20, reps: 20 },
        { type: "working", weight: 50, reps: 8 },
      ],
      curr: [{ type: "warm-up", weight: 0, reps: 0 }],
      recs: [{ type: "warm-up", weight: 30, reps: 20 }],
    });
  });

  test("multiple current warm-up sets, current is not filled -> independent recommendations", () => {
    testRecommendations({
      prev: [
        { type: "warm-up", weight: 10, reps: 30 },
        { type: "working", weight: 50, reps: 8 },
      ],
      curr: [
        { type: "warm-up", weight: 0, reps: 0 },
        { type: "warm-up", weight: 0, reps: 0 },
      ],
      recs: [
        { type: "warm-up", weight: 25, reps: 30 },
        { type: "warm-up", weight: 0, reps: 0 },
      ],
    });
  });
});

describe("single working set", () => {
  test("current set is filled -> use filled values", () => {
    testRecommendations({
      prev: [{ type: "working", weight: 30, reps: 8 }],
      curr: [{ type: "working", weight: 27.5, reps: 20 }],
      recs: [{ type: "working", weight: 27.5, reps: 20 }],
    });
  });

  test("no previous set, weight filled -> use filled values", () => {
    testRecommendations({
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
      prev: [{ type: "working", weight: 4, reps: 12 }],
      curr: [{ type: "working", weight: 0, reps: 0 }],
      recs: [{ type: "working", weight: 4, reps: 14 }],
    });
  });

  test("current weight equals previous weight -> recommend more reps", () => {
    testRecommendations({
      prev: [{ type: "working", weight: 12.5, reps: 12 }],
      curr: [{ type: "working", weight: 12.5, reps: 0 }],
      recs: [{ type: "working", weight: 12.5, reps: 14 }],
    });
  });

  test("current weight greater than previous weight -> recommend less reps", () => {
    testRecommendations({
      prev: [{ type: "working", weight: 10, reps: 12 }],
      curr: [{ type: "working", weight: 12.5, reps: 0 }],
      recs: [{ type: "working", weight: 12.5, reps: 4 }],
    });
  });

  test("current weight less than previous weight -> recommend more reps", () => {
    testRecommendations({
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
