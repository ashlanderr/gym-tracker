import * as Y from "yjs";
import {
  addExercise,
  addPerformance,
  addSet,
  type Performance,
  type Set,
  type Store,
} from "../db";
import { queryMissingInventory, queryPendingWeight } from "./notices.ts";

function performance(store: Store, id: string, startedAt: number) {
  return addPerformance(store, {
    id,
    user: "user",
    workout: id,
    exercise: "exercise",
    order: 0,
    startedAt,
    program: undefined,
  });
}

function set(
  store: Store,
  owner: Performance,
  order: number,
  data: Pick<Set, "type" | "weight" | "reps" | "completed">,
) {
  addSet(store, {
    id: `${owner.id}-${order}`,
    user: "user",
    workout: owner.workout,
    exercise: owner.exercise,
    performance: owner.id,
    order,
    ...data,
  } as Set);
}

const DAY_MS = 24 * 60 * 60 * 1000;

function workoutAfterTopReps(breakMs = DAY_MS) {
  const store: Store = { personal: new Y.Doc(), hasServer: false };
  const last = performance(store, "last", 1);
  for (const order of [0, 1]) {
    set(store, last, order, {
      type: "working",
      weight: 80,
      reps: 8,
      completed: true,
    });
  }
  const today = emptyPerformance(store, "today", 1 + breakMs);
  return { store, today };
}

function emptyPerformance(store: Store, id: string, startedAt: number) {
  const today = performance(store, id, startedAt);
  set(store, today, 0, {
    type: "warm-up",
    weight: undefined,
    reps: undefined,
    completed: false,
  });
  for (const order of [1, 2]) {
    set(store, today, order, {
      type: "working",
      weight: undefined,
      reps: undefined,
      completed: false,
    });
  }
  return today;
}

test("offers a new weight while no working set has one", () => {
  const { store, today } = workoutAfterTopReps();
  expect(queryPendingWeight(store, today)).toEqual({
    type: "increase",
    from: 80,
    to: 82.5,
    range: { min: 6, max: 8 },
  });
});

test("is answered by a weight in a working set", () => {
  const { store, today } = workoutAfterTopReps();
  set(store, today, 1, {
    type: "working",
    weight: 80,
    reps: undefined,
    completed: false,
  });
  expect(queryPendingWeight(store, today)).toBeNull();
});

test("is not answered by a warm-up weight", () => {
  const { store, today } = workoutAfterTopReps();
  set(store, today, 0, {
    type: "warm-up",
    weight: 40,
    reps: undefined,
    completed: false,
  });
  expect(queryPendingWeight(store, today)).not.toBeNull();
});

test("asks for a weight when the exercise has no history", () => {
  const store: Store = { personal: new Y.Doc(), hasServer: false };
  const today = emptyPerformance(store, "today", 1);
  expect(queryPendingWeight(store, today)).toEqual({ type: "unknown" });
});

test("asks for a weight after a long break instead of a new weight", () => {
  const { store, today } = workoutAfterTopReps(100 * DAY_MS);
  expect(queryPendingWeight(store, today)).toEqual({
    type: "unknown",
    last: { weight: 80, startedAt: 1 },
  });
});

test("asks for the inventory until it is set", () => {
  const store: Store = { personal: new Y.Doc(), hasServer: false };
  addExercise(store, {
    id: "exercise",
    name: "Exercise",
    muscles: [],
    equipment: "barbell",
  });
  const today = performance(store, "today", 1);
  expect(queryMissingInventory(store, today)).toBe(true);
  expect(
    queryMissingInventory(store, {
      ...today,
      weights: { units: "kg", base: 20, steps: [5], count: 2 },
    }),
  ).toBe(false);
});
