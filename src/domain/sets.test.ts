import type { Set, SetType } from "../db";
import { startsRest } from "./sets.ts";

function set(id: string, type: SetType): Set {
  return {
    id,
    user: "user",
    workout: "workout",
    exercise: "exercise",
    performance: "performance",
    order: Number(id),
    type,
    weight: undefined,
    reps: undefined,
    completed: false,
  };
}

describe("rest after a set", () => {
  const sets = [
    set("0", "warm-up"),
    set("1", "warm-up"),
    set("2", "working"),
    set("3", "working"),
  ];
  const rests = sets.map((s) => startsRest(sets, s));

  test("waits between warm-ups", () => {
    expect(rests[0]).toBe(false);
  });

  test("starts before the first working set", () => {
    expect(rests[1]).toBe(true);
  });

  test("starts after every working set, the last one included", () => {
    expect(rests.slice(2)).toEqual([true, true]);
  });
});
