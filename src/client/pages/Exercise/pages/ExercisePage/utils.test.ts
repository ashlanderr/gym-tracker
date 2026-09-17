import { buildHistory, buildSessions } from "./utils.ts";
import type { Performance, Set, SetType } from "../../../../db";

const DAY = 24 * 3600 * 1000;
const NOW = new Date(2026, 8, 17).valueOf();

function performance(id: string, workout: string, daysAgo: number) {
  return {
    id,
    user: "user",
    workout,
    exercise: "bench",
    slot: id,
    order: 0,
    startedAt: NOW - daysAgo * DAY,
    reps: { min: 6, max: 8 },
  } satisfies Performance;
}

function set(
  performance: string,
  order: number,
  type: SetType,
  weight: number,
  reps: number,
): Set {
  return {
    id: `${performance}-${order}`,
    user: "user",
    workout: "",
    exercise: "bench",
    performance,
    slot: performance,
    order,
    type,
    weight,
    reps,
    completed: true,
  };
}

test("history has one point per workout from working sets", () => {
  const sessions = buildSessions(
    [
      performance("old", "w1", 200),
      performance("heavy", "w2", 10),
      performance("light", "w2", 10),
    ],
    [
      set("old", 0, "working", 50, 8),
      set("heavy", 0, "warm-up", 20, 12),
      set("heavy", 1, "working", 60, 8),
      set("light", 0, "working", 40, 10),
    ],
  );

  expect(sessions.map((s) => s.performance.id)).toEqual([
    "heavy",
    "light",
    "old",
  ]);

  const points = buildHistory(sessions, "three_months", (w) => w, NOW);

  expect(points).toHaveLength(1);
  expect(points[0].maxWeight).toBe(60);
  expect(points[0].bestRepMax).toBeCloseTo(74.5, 1);
  expect(points[0].averageRepMax).toBeCloseTo(63.9, 1);

  expect(buildHistory(sessions, "all", (w) => w, NOW)).toHaveLength(2);
});
