import * as Y from "yjs";
import {
  querySetsByPerformance,
  type Store,
  updateSet,
  updateWorkout,
} from "../db";
import { computeMuscleLevels, queryRecentMuscleWork } from "./muscles.ts";
import { EXERCISES } from "../db/exercises/constants.ts";
import { addWorkout } from "./workout.ts";
import { addPerformance } from "./performances.ts";

const BENCH_PRESS = EXERCISES["bench_press"];
const LATERAL_RAISE = EXERCISES["lateral_raise"];
const TRICEPS_PUSHDOWN = EXERCISES["triceps_pushdown_rope"];

const DAY = 24 * 60 * 60 * 1000;
const NOW = 1000 * DAY;

function createStore(): Store {
  return { documentId: "test", personal: new Y.Doc() };
}

function doneAt(store: Store, startedAt: number, exercise: string) {
  const workout = updateWorkout(store, {
    ...addWorkout(store, "user"),
    startedAt,
  });
  const performance = addPerformance(store, workout, exercise);
  for (const set of querySetsByPerformance(store, performance.id)) {
    updateSet(store, { ...set, weight: 20, reps: 10, completed: true });
  }
}

test("muscles are ranked against the busiest one", () => {
  const levels = computeMuscleLevels([
    { exercise: BENCH_PRESS, sets: 3 },
    { exercise: LATERAL_RAISE, sets: 1 },
    { exercise: TRICEPS_PUSHDOWN, sets: 0 },
  ]);

  // Chest carries 3 as the only primary of three sets; shoulders reach the same
  // level off 1.5 secondary plus a primary set of their own; triceps sit a
  // level lower on secondary work alone, and traps scrape the bottom.
  expect(levels).toEqual({
    chest: 3,
    shoulders: 3,
    triceps: 2,
    traps: 1,
  });
});

test("nothing done means nothing highlighted", () => {
  expect(computeMuscleLevels([{ exercise: BENCH_PRESS, sets: 0 }])).toEqual({});
  expect(computeMuscleLevels([])).toEqual({});
});

test("the month counts only the workouts inside it", () => {
  const store = createStore();
  expect(queryRecentMuscleWork(store, NOW)).toEqual({ work: [], workouts: 0 });

  doneAt(store, NOW - 40 * DAY, "lateral_raise");
  doneAt(store, NOW - 5 * DAY, "bench_press");

  const { work, workouts } = queryRecentMuscleWork(store, NOW);
  expect(workouts).toBe(1);
  expect(work.map((w) => w.exercise.id)).toEqual(["bench_press"]);
});
