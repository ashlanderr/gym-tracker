import type { Performance, Set } from "../../../../db";
import { formatDuration, summarizeExercises } from "./utils.ts";

function performance(id: string, exercise: string): Performance {
  return {
    id,
    user: "user",
    workout: "workout",
    exercise,
    order: 0,
    startedAt: 0,
    program: undefined,
  };
}

function set(
  performance: string,
  weight: number | undefined,
  reps: number | undefined,
): Set {
  const base = {
    id: `${performance}-${weight}-${reps}`,
    user: "user",
    workout: "workout",
    exercise: "exercise",
    performance,
    order: 0,
    type: "working" as const,
  };
  return weight === undefined || reps === undefined
    ? { ...base, weight, reps, completed: false }
    : { ...base, weight, reps, completed: true };
}

describe("exercise summary", () => {
  it("counts the done sets and picks the heaviest, then by reps", () => {
    const summary = summarizeExercises(
      [performance("bench", "e1"), performance("row", "e2")],
      [
        set("bench", 60, 8),
        set("bench", 62.5, 5),
        set("bench", 62.5, 6),
        set("bench", undefined, undefined),
        set("row", undefined, undefined),
      ],
    );

    expect(summary).toEqual([
      {
        performance: "bench",
        exercise: "e1",
        done: 3,
        total: 4,
        best: { weight: 62.5, reps: 6 },
      },
      { performance: "row", exercise: "e2", done: 0, total: 1, best: null },
    ]);
  });
});

describe("workout duration", () => {
  it("says hours with padded minutes and minutes alone", () => {
    expect(formatDuration(65 * 60_000)).toBe("1 ч 05 мин");
    expect(formatDuration(42 * 60_000 + 20_000)).toBe("42 мин");
  });
});
