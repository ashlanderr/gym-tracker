import * as Y from "yjs";
import {
  addPerformance,
  addRecord,
  addSet,
  addWorkout,
  type Record,
  type RecordType,
  readSchemaVersion,
  type Store,
} from "../db";
import { migrateData, SCHEMA_VERSION } from "./migrations.ts";

const exercise = "OvlOX8JCqg0lEuaPBU3G";

function workout(
  store: Store,
  id: string,
  startedAt: number,
  sets: number[][],
) {
  addWorkout(store, {
    id,
    user: "user",
    name: id,
    startedAt,
    completedAt: startedAt,
  });
  addPerformance(store, {
    id,
    user: "user",
    workout: id,
    exercise,
    order: 0,
    startedAt,
    program: undefined,
  });
  sets.forEach(([weight, reps], order) =>
    addSet(store, {
      id: `${id}-${order}`,
      user: "user",
      workout: id,
      exercise,
      performance: id,
      order,
      type: "working",
      weight,
      reps,
      completed: true,
    }),
  );
}

function record(store: Store, id: string, type: RecordType, current: number) {
  addRecord(store, {
    id: `${type}-${id}`,
    user: "user",
    workout: id,
    exercise,
    performance: id,
    set: `${id}-0`,
    createdAt: 0,
    type,
    previous: undefined,
    current,
    full: current,
    program: undefined,
  });
}

function records(store: Store, type: RecordType) {
  return [...store.personal.getMap<Y.Map<unknown>>("records").values()]
    .map((r) => r.toJSON() as Record)
    .filter((r) => r.type === type)
    .map((r) => [r.performance, round(r.current), round(r.previous)])
    .sort();
}

function round(value: number | undefined) {
  return value !== undefined ? Math.round(value * 100) / 100 : undefined;
}

test("builds the records of 1RM again by Epley", () => {
  const store: Store = { personal: new Y.Doc(), hasServer: false };
  store.personal.getMap("meta").set("version", SCHEMA_VERSION - 1);

  // 90 × 10 and 103 × 5 are 120 and 115.9 by Brzycki, 120 and 120.17 by Epley
  workout(store, "b", 2, [[103, 5]]);
  workout(store, "a", 1, [[90, 10]]);
  record(store, "a", "one_rep_max", 120);
  record(store, "gone", "one_rep_max", 999);
  record(store, "a", "weight", 90);

  migrateData(store.personal);

  expect(records(store, "one_rep_max")).toEqual([
    ["a", 120, undefined],
    ["b", 120.17, 120],
  ]);
  expect(records(store, "weight")).toEqual([["a", 90, undefined]]);
  expect(readSchemaVersion(store.personal)).toBe(SCHEMA_VERSION);
});
