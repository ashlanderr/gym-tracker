import type { Performance, Set } from "../db";
import { findNextSet, groupSets } from "./order.ts";

function performance(id: string, order: number): Performance {
  return {
    id,
    user: "user",
    workout: "workout",
    exercise: id,
    order,
    startedAt: 0,
    program: undefined,
  };
}

function set(performance: string, order: number, completed: boolean): Set {
  const base = {
    id: `${performance}-${order}`,
    user: "user",
    workout: "workout",
    exercise: performance,
    performance,
    order,
    type: "working" as const,
  };
  return completed
    ? { ...base, weight: 20, reps: 10, completed: true }
    : { ...base, weight: undefined, reps: undefined, completed: false };
}

describe("next set", () => {
  const performances = [performance("a", 0), performance("b", 1)];
  const next = (...sets: Set[]) =>
    findNextSet(performances, groupSets(sets))?.id;

  test("is the first set not done in the order of sets", () => {
    expect(next(set("a", 1, false), set("a", 0, true))).toBe("a-1");
  });

  test("goes to the next exercise when one is done", () => {
    expect(next(set("b", 0, false), set("a", 0, true))).toBe("b-0");
  });

  test("follows the order of exercises", () => {
    expect(next(set("b", 0, false), set("a", 0, false))).toBe("a-0");
  });

  test("is none when every set is done", () => {
    expect(next(set("a", 0, true))).toBeUndefined();
  });
});
