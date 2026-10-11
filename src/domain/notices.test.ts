import * as Y from "yjs";
import {
  addPerformance,
  addSet,
  type Performance,
  type Set,
  type Store,
} from "../db";
import { queryPendingIncrease } from "./notices.ts";

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

function workoutAfterTopReps() {
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
  const today = performance(store, "today", 2);
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
  return { store, today };
}

test("offers a new weight while no working set has one", () => {
  const { store, today } = workoutAfterTopReps();
  expect(queryPendingIncrease(store, today)).toEqual({
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
  expect(queryPendingIncrease(store, today)).toBeNull();
});

test("is not answered by a warm-up weight", () => {
  const { store, today } = workoutAfterTopReps();
  set(store, today, 0, {
    type: "warm-up",
    weight: 40,
    reps: undefined,
    completed: false,
  });
  expect(queryPendingIncrease(store, today)).not.toBeNull();
});
