import * as Y from "yjs";
import {
  querySetsByPerformance,
  type Store,
  updateSet,
  updateWorkout,
} from "../../db";
import { addWorkout } from "../workout.ts";
import { addPerformance } from "../performances.ts";
import { queryLiftStrength } from "./lifts.ts";

const DAY = 24 * 60 * 60 * 1000;
const NOW = 1000 * DAY;

function createStore(): Store {
  return { documentId: "test", personal: new Y.Doc() };
}

function benchAt(store: Store, startedAt: number, weight: number) {
  const workout = updateWorkout(store, {
    ...addWorkout(store, "user"),
    startedAt,
  });
  const performance = addPerformance(store, workout, "bench_press");
  for (const set of querySetsByPerformance(store, performance.id)) {
    updateSet(store, { ...set, weight, reps: 8, completed: true });
  }
}

test("the best set of the window wins over a heavier one before it", () => {
  const store = createStore();
  benchAt(store, NOW - 100 * DAY, 120);
  benchAt(store, NOW - 10 * DAY, 100);

  expect(queryLiftStrength(store, "bench", NOW)).toEqual({
    lift: "bench",
    source: "history",
    oneRepMax: 100 * (1 + 8 / 30),
  });
});

test("a lift done only before the window has no strength to show", () => {
  const store = createStore();
  benchAt(store, NOW - 100 * DAY, 120);

  expect(queryLiftStrength(store, "bench", NOW).source).toBe("stale");
});

test("a lift never done has no strength to show", () => {
  expect(queryLiftStrength(createStore(), "bench", NOW)).toEqual({
    lift: "bench",
    source: "none",
    oneRepMax: null,
  });
});
