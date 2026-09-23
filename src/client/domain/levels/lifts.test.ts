import * as Y from "yjs";
import {
  addMeasurement,
  type Profile,
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

function createProfile(anchors: Profile["anchors"] = {}): Profile {
  return { id: "current", user: "user", sex: "male", anchors, createdAt: 0 };
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

function weighIn(store: Store, createdAt: number, value: number) {
  addMeasurement(store, {
    id: `weight-${createdAt}`,
    user: "user",
    type: "weight",
    value,
    createdAt,
  });
}

test("the best set of the window wins over a heavier one before it", () => {
  const store = createStore();
  benchAt(store, NOW - 100 * DAY, 120);
  benchAt(store, NOW - 10 * DAY, 100);

  expect(queryLiftStrength(store, createProfile(), "bench", NOW)).toEqual({
    anchor: "bench",
    source: "history",
    oneRepMax: 100 * (1 + 8 / 30),
  });
});

test("a lift done only before the window has no strength to show", () => {
  const store = createStore();
  benchAt(store, NOW - 100 * DAY, 120);

  const profile = createProfile({
    bench: { weight: 80, reps: 5, createdAt: 0 },
  });
  expect(queryLiftStrength(store, profile, "bench", NOW).source).toBe("stale");
});

test("an answered pullup meets the body weight written with it", () => {
  const store = createStore();
  weighIn(store, 1, 70);
  weighIn(store, 500, 80);
  weighIn(store, 900, 90);

  const profile = createProfile({
    pullup: { weight: 10, reps: 5, createdAt: 500 },
  });
  expect(queryLiftStrength(store, profile, "pullup", NOW)).toEqual({
    anchor: "pullup",
    source: "survey",
    oneRepMax: 90 * (1 + 5 / 30),
  });
});

test("a lift left unanswered reads the novice default", () => {
  expect(
    queryLiftStrength(createStore(), createProfile(), "bench", NOW),
  ).toEqual({ anchor: "bench", source: "default", oneRepMax: 45 });
});
