import * as Y from "yjs";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  type CompletedSet,
  queryProfile,
  queryRecordsByWorkout,
  querySetsByPerformance,
  type Sex,
  type Store,
  updateSet,
  type Workout,
} from "../db";
import { addPerformance } from "./performances.ts";
import { updateRecords } from "./records.ts";
import { addWorkout, completeWorkout } from "./workout.ts";
import { completeOnboarding } from "./profile.ts";
import { mergeInto, summarizeHistory } from "./account.ts";

const DAY = 24 * 60 * 60 * 1000;

// Yjs settles two writes under one key by client id, so the ids are fixed
// for the phone to win whenever nothing else decides.
function createStore(clientID: number): Store {
  const personal = new Y.Doc();
  personal.clientID = clientID;
  return { documentId: "test", personal };
}

function onboard(store: Store, sex: Sex) {
  completeOnboarding(
    store,
    "user",
    { sex, heightCm: 170, weightKg: 70, anchors: {} },
    0,
  );
}

function train(store: Store, day: number, weight: number): Workout {
  vi.setSystemTime(day * DAY);
  const workout = addWorkout(store, "user");
  const performance = addPerformance(store, workout, "bench_press");
  for (const set of querySetsByPerformance(store, performance.id)) {
    const done: CompletedSet = { ...set, weight, reps: 8, completed: true };
    updateSet(store, done);
    updateRecords(store, done);
  }
  return completeWorkout(store, workout, "Тренировка");
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

it("brings the workouts of the phone into the account", () => {
  const account = createStore(1);
  onboard(account, "male");
  train(account, 1, 100);
  const phone = createStore(2);
  onboard(phone, "female");
  train(phone, 2, 50);

  mergeInto(account, phone);

  const summary = summarizeHistory(account);
  expect(summary.workouts).toBe(2);
  expect(summary.lastWorkout).toBe(2 * DAY);
});

it("keeps the answers of the account", () => {
  const account = createStore(1);
  onboard(account, "male");
  const phone = createStore(2);
  onboard(phone, "female");

  mergeInto(account, phone);

  expect(queryProfile(account)?.sex).toBe("male");
});

it("takes the answers of the phone when the account has none", () => {
  const account = createStore(1);
  const phone = createStore(2);
  onboard(phone, "female");

  mergeInto(account, phone);

  expect(queryProfile(account)?.sex).toBe("female");
});

it("counts records again over both histories", () => {
  const account = createStore(1);
  onboard(account, "male");
  train(account, 1, 100);
  const phone = createStore(2);
  onboard(phone, "male");
  const lighter = train(phone, 2, 80);

  mergeInto(account, phone);

  expect(queryRecordsByWorkout(account, lighter.id)).toEqual([]);
  expect(summarizeHistory(account).recordExercises).toBe(1);
});
