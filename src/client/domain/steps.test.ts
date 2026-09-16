import { buildWorkoutSteps, findCurrentStep } from "./steps.ts";
import type { Performance, Set, SetType } from "../db";

function performance(id: string, order: number): Performance {
  return {
    id,
    user: "user",
    workout: "workout",
    exercise: id,
    slot: id,
    order,
    startedAt: 0,
    reps: { min: 6, max: 8 },
  };
}

function set(
  id: string,
  performance: string,
  order: number,
  type: SetType,
  completed = false,
): Set {
  const base = {
    id,
    user: "user",
    workout: "workout",
    exercise: performance,
    performance,
    slot: performance,
    order,
    type,
  };
  return completed
    ? { ...base, weight: 20, reps: 10, completed: true }
    : { ...base, weight: undefined, reps: undefined, completed: false };
}

test("steps follow the workout order and count sets by type", () => {
  const steps = buildWorkoutSteps(
    [performance("squat", 1), performance("bench", 0)],
    [
      set("s1", "squat", 0, "working"),
      set("b3", "bench", 2, "working"),
      set("b1", "bench", 0, "warm-up", true),
      set("b2", "bench", 1, "working", true),
    ],
  );

  expect(steps.map((s) => [s.set.id, s.number, s.count])).toEqual([
    ["b1", 1, 1],
    ["b2", 1, 2],
    ["b3", 2, 2],
    ["s1", 1, 1],
  ]);
  expect(steps.map((s) => s.isLast)).toEqual([false, false, false, true]);
  expect(findCurrentStep(steps)?.set.id).toBe("b3");
});
