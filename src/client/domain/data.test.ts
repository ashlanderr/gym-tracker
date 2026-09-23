import * as Y from "yjs";
import {
  addMeasurement,
  collection,
  type CompletedSet,
  queryCollection,
  queryDataSummary,
  queryProfile,
  querySetsByPerformance,
  type Store,
  updateSet,
  type Workout,
} from "../db";
import { addPerformance } from "./performances.ts";
import { updateRecords } from "./records.ts";
import { addWorkout, completeWorkout } from "./workout.ts";
import { completeOnboarding } from "./profile.ts";
import { deleteAllData, deleteWorkoutHistory, resetRecords } from "./data.ts";

function createStore(): Store {
  return { documentId: "test", personal: new Y.Doc() };
}

function onboard(store: Store) {
  completeOnboarding(
    store,
    "user",
    { sex: "male", heightCm: 180, weightKg: 80, anchors: {} },
    0,
  );
}

function train(store: Store, exercise: string, weight: number): Workout {
  const workout = addWorkout(store, "user");
  const performance = addPerformance(store, workout, exercise);
  for (const set of querySetsByPerformance(store, performance.id)) {
    const done: CompletedSet = { ...set, weight, reps: 8, completed: true };
    updateSet(store, done);
    updateRecords(store, done);
  }
  return completeWorkout(store, workout, "Тренировка");
}

function workouts(store: Store): Workout[] {
  return queryCollection<Workout>(collection(store.personal, "workouts"), {});
}

test("the summary counts what the danger zone deletes", () => {
  const store = createStore();
  onboard(store);
  train(store, "bench_press", 60);
  train(store, "back_squat", 80);

  const summary = queryDataSummary(store);
  expect(summary.workouts).toBe(2);
  expect(summary.recordExercises).toBe(2);
  expect(summary.sets).toBeGreaterThan(0);
  expect(summary.records).toBeGreaterThan(0);
  expect(summary.measurements).toBe(2);
});

test("resetting records keeps the training and wins the next medal", () => {
  const store = createStore();
  train(store, "bench_press", 60);
  const sets = queryDataSummary(store).sets;

  resetRecords(store);

  expect(queryDataSummary(store)).toMatchObject({ sets, records: 0 });
  expect(workouts(store).every((w) => w.records === undefined)).toBe(true);

  const next = train(store, "bench_press", 50);
  expect(next.records).toBeGreaterThan(0);
});

test("deleting the history keeps the profile and the measurements", () => {
  const store = createStore();
  onboard(store);
  train(store, "bench_press", 60);

  deleteWorkoutHistory(store);

  expect(queryDataSummary(store)).toEqual({
    workouts: 0,
    sets: 0,
    records: 0,
    recordExercises: 0,
    measurements: 2,
  });
  expect(queryProfile(store)).not.toBeNull();
});

test("deleting everything leaves no profile to open the app on", () => {
  const store = createStore();
  onboard(store);
  train(store, "bench_press", 60);
  addMeasurement(store, {
    id: "later",
    user: "user",
    type: "weight",
    value: 79,
    createdAt: 10,
  });

  deleteAllData(store);

  expect(queryProfile(store)).toBeNull();
  expect(queryDataSummary(store).measurements).toBe(0);
  expect(queryDataSummary(store).workouts).toBe(0);
});
