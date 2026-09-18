import { buildFinishSummary } from "./utils.ts";
import { EXERCISES } from "../../db/exercises/constants.ts";
import type { Performance, Record, RecordType, Set } from "../../db";

const BENCH = EXERCISES["OvlOX8JCqg0lEuaPBU3G"];
const ROW = EXERCISES["7WHNH0KA8Fved2WkuQ1s"];

const performance = (id: string, exercise: string, order: number) =>
  ({
    id,
    user: "user",
    workout: "w",
    exercise,
    slot: id,
    order,
    startedAt: 0,
    reps: { min: 6, max: 8 },
  }) satisfies Performance;

const done = (
  id: string,
  p: string,
  exercise: string,
  weight: number,
): Set => ({
  id,
  user: "user",
  workout: "w",
  exercise,
  performance: p,
  slot: p,
  order: 0,
  type: "working",
  weight,
  reps: 8,
  completed: true,
});

const record = (
  performance: string,
  set: string,
  type: RecordType,
  current: number,
  previous: number | undefined,
): Record => ({
  id: `${performance}-${type}`,
  user: "user",
  workout: "w",
  exercise: "",
  performance,
  set,
  createdAt: 0,
  type,
  previous,
  current,
});

test("summary reports beaten records and repeats today's weight", () => {
  const summary = buildFinishSummary({
    performances: [
      performance("row", ROW.id, 1),
      performance("bench", BENCH.id, 0),
    ],
    sets: [
      done("b1", "bench", BENCH.id, 60),
      done("b2", "bench", BENCH.id, 62.5),
      done("r1", "row", ROW.id, 50),
      {
        ...done("r2", "row", ROW.id, 0),
        weight: undefined,
        reps: undefined,
        completed: false,
      },
    ],
    records: [
      record("bench", "b2", "one_rep_max", 77.6, 75),
      record("bench", "b2", "weight", 62.5, 60),
      record("row", "r1", "one_rep_max", 62, undefined),
      record("row", "r1", "weight", 50, 45),
    ],
    exercises: new Map([
      [BENCH.id, BENCH],
      [ROW.id, ROW],
    ]),
  });

  expect(summary.completedSets).toBe(3);
  expect(summary.skippedSets).toBe(1);
  expect(summary.volume).toBe((60 + 62.5 + 50) * 8);
  expect(summary.events).toEqual([
    { type: "best_set", exercise: BENCH, weight: 62.5, reps: 8 },
    { type: "max_weight", exercise: ROW, weight: 50, reps: 8 },
  ]);
  expect(summary.nextTime.map((n) => [n.exercise.id, n.weight])).toEqual([
    [BENCH.id, 62.5],
    [ROW.id, 50],
  ]);
});
