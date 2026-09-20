import * as Y from "yjs";
import {
  queryPerformancesByWorkout,
  queryPreviousPerformance,
  querySetsByPerformance,
  type Store,
  updateSet,
  updateWorkout,
  type Workout,
} from "../db";
import { addWorkout, duplicateWorkout } from "./workout.ts";
import { addNextSet } from "./sets.ts";
import { addPerformance, replacePerformance } from "./performances.ts";

const BENCH_PRESS = "bench_press";
const DUMBBELL_PRESS = "uTAoik0jk8O6L43JTxWm";
const BUTTERFLY = "tX9HxwCkIckqNaEaf2Dq";

function createStore(): Store {
  return { documentId: "test", personal: new Y.Doc() };
}

function startWorkout(store: Store, startedAt: number): Workout {
  const workout = addWorkout(store, "user");
  return updateWorkout(store, { ...workout, startedAt });
}

function completeSets(store: Store, performance: string, weight: number) {
  for (const set of querySetsByPerformance(store, performance)) {
    updateSet(store, { ...set, weight, reps: 8, completed: true });
  }
}

test("duplicated workout continues the history of each slot", () => {
  const store = createStore();
  const first = startWorkout(store, 1);

  const heavy = addPerformance(store, first, BENCH_PRESS);
  addNextSet(store, heavy);
  completeSets(store, heavy.id, 100);

  const light = addPerformance(store, first, BENCH_PRESS);
  completeSets(store, light.id, 60);

  const second = duplicateWorkout(store, first);
  const [newHeavy, newLight] = queryPerformancesByWorkout(store, second.id);

  expect(newHeavy.slot).toBe(heavy.slot);
  expect(newLight.slot).toBe(light.slot);
  expect(querySetsByPerformance(store, newHeavy.id)).toHaveLength(2);
  expect(querySetsByPerformance(store, newLight.id)).toHaveLength(1);

  const previous = queryPreviousPerformance(
    store,
    newLight.slot,
    BENCH_PRESS,
    second.startedAt,
  );
  expect(previous?.id).toBe(light.id);
});

test("replaced exercise gets a new slot and the exercise history", () => {
  const store = createStore();

  const past = startWorkout(store, 1);
  const pastPress = addPerformance(store, past, DUMBBELL_PRESS);
  completeSets(store, pastPress.id, 40);

  const current = startWorkout(store, 2);
  const bench = addPerformance(store, current, BENCH_PRESS);
  addPerformance(store, current, BUTTERFLY);
  const replaced = replacePerformance(store, bench, DUMBBELL_PRESS);

  expect(replaced.slot).not.toBe(bench.slot);
  expect(replaced.slot).not.toBe(pastPress.slot);
  expect(replaced.order).toBe(bench.order);

  const previous = queryPreviousPerformance(
    store,
    replaced.slot,
    DUMBBELL_PRESS,
    current.startedAt,
  );
  expect(previous?.id).toBe(pastPress.id);
});
