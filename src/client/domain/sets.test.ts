import * as Y from "yjs";
import {
  defaultGym,
  type DraftSet,
  querySetsByPerformance,
  type Store,
  updateGym,
  updateSet,
} from "../db";
import { addWorkout } from "./workout.ts";
import { addPerformance } from "./performances.ts";
import { completeSet, rebuildWarmUps } from "./sets.ts";
import type { RecSetData } from "./recommendations";

const BENCH_PRESS = "bench_press";

const FINDING: RecSetData = {
  type: "working",
  weight: 20,
  reps: { min: 6, max: 8 },
  isFinding: true,
};

const WARM_UP: RecSetData = {
  type: "warm-up",
  weight: 30,
  reps: { min: 12, max: 12 },
  isFinding: false,
};

function setup() {
  const store: Store = { documentId: "test", personal: new Y.Doc() };
  updateGym(store, {
    ...defaultGym("user"),
    bars: { units: "kg", items: [20] },
    plates: { units: "kg", items: [20, 10, 5, 2.5, 1.25] },
  });
  const workout = addWorkout(store, "user");
  const performance = addPerformance(store, workout, BENCH_PRESS);
  const sets = () => querySetsByPerformance(store, performance.id);
  const draft = (index: number) => sets()[index] as DraftSet;
  return { store, performance, sets, draft };
}

test("a new working weight rebuilds the warm-up, done sets included", () => {
  const { store, performance, sets, draft } = setup();
  expect(sets().map((s) => s.type)).toEqual(["working", "working", "working"]);

  updateSet(store, { ...draft(0), weight: 60 });
  rebuildWarmUps(store, performance);
  expect(sets().map((s) => s.type)).toEqual([
    "warm-up",
    "warm-up",
    "working",
    "working",
    "working",
  ]);

  completeSet(store, performance, draft(0), WARM_UP);
  rebuildWarmUps(store, performance);
  expect(sets()[0].completed).toBe(true);

  updateSet(store, { ...draft(2), weight: 80 });
  rebuildWarmUps(store, performance);
  expect(sets().filter((s) => s.type === "warm-up")).toHaveLength(2);
  expect(sets().some((s) => s.completed)).toBe(false);
});

test("there is no rest between warm-up sets", () => {
  const { store, performance, draft } = setup();
  updateSet(store, { ...draft(0), weight: 60 });
  rebuildWarmUps(store, performance);

  expect(completeSet(store, performance, draft(0), WARM_UP)?.rest).toBe(false);
  expect(completeSet(store, performance, draft(1), WARM_UP)?.rest).toBe(true);
});

test("finding asks only while no later set is done", () => {
  const { store, performance, sets, draft } = setup();
  updateSet(store, { ...draft(1), weight: 25, reps: 8 });
  updateSet(store, { ...draft(2), weight: 30, reps: 8 });

  const first = completeSet(store, performance, draft(0), FINDING);
  expect(first?.question).toBe("finding");
  expect(sets()[2]).toMatchObject({ weight: undefined, reps: undefined });

  updateSet(store, { ...draft(1), weight: 25 });
  updateSet(store, { ...draft(2), weight: 25 });
  completeSet(store, performance, draft(2), undefined);
  const redone = completeSet(store, performance, draft(1), FINDING);
  expect(redone?.question).toBeUndefined();
});
