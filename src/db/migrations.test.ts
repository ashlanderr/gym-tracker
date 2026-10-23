import * as Y from "yjs";
import { migrate, readSchemaVersion, SCHEMA_VERSION } from "./migrations.ts";
import type { Store } from "./doc.ts";
import { addPerformance } from "./performances.ts";
import { addRecord, type Record, type RecordType } from "./records.ts";
import { addSet } from "./sets.ts";
import { addWorkout } from "./workouts.ts";

function log(doc: Y.Doc, entry: string) {
  doc.getArray<string>("log").push([entry]);
}

const migrations = [
  (doc: Y.Doc) => log(doc, "0→1"),
  (doc: Y.Doc) => log(doc, "1→2"),
];

test("migrates a document without a version from the start", () => {
  const doc = new Y.Doc();
  migrate(doc, migrations);
  expect(doc.getArray("log").toArray()).toEqual(["0→1", "1→2"]);
  expect(readSchemaVersion(doc)).toBe(2);
});

test("runs only the migrations after the stored version", () => {
  const doc = new Y.Doc();
  migrate(doc, migrations.slice(0, 1));
  migrate(doc, migrations);
  expect(doc.getArray("log").toArray()).toEqual(["0→1", "1→2"]);
});

test("leaves a document from a newer version alone", () => {
  const doc = new Y.Doc();
  doc.getMap("meta").set("version", 5);
  migrate(doc, migrations);
  expect(doc.getArray("log").length).toBe(0);
  expect(readSchemaVersion(doc)).toBe(5);
});

test("merges light and failure sets into working ones", () => {
  const doc = new Y.Doc();
  const sets = doc.getMap<Y.Map<unknown>>("sets");
  for (const type of ["warm-up", "working", "light", "failure"]) {
    sets.set(type, new Y.Map([["type", type]]));
  }
  migrate(doc);
  expect([...sets.values()].map((s) => s.get("type"))).toEqual([
    "warm-up",
    "working",
    "working",
    "working",
  ]);
});

test("replaces rep presets of changed exercises with ranges", () => {
  const doc = new Y.Doc();
  const exercises = doc.getMap<Y.Map<unknown>>("exercises");
  const custom = { min: 5, max: 10 };
  for (const reps of ["low", "medium", "high", custom, undefined]) {
    exercises.set(String(exercises.size), new Y.Map([["reps", reps]]));
  }
  migrate(doc);
  expect([...exercises.values()].map((e) => e.get("reps"))).toEqual([
    { min: 6, max: 8 },
    { min: 8, max: 12 },
    { min: 12, max: 15 },
    custom,
    undefined,
  ]);
});

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
  store.personal.getMap("meta").set("version", 2);

  // 90 × 10 and 103 × 5 are 120 and 115.9 by Brzycki, 120 and 120.17 by Epley
  workout(store, "b", 2, [[103, 5]]);
  workout(store, "a", 1, [[90, 10]]);
  record(store, "a", "one_rep_max", 120);
  record(store, "gone", "one_rep_max", 999);
  record(store, "a", "weight", 90);

  migrate(store.personal);

  expect(records(store, "one_rep_max")).toEqual([
    ["a", 120, undefined],
    ["b", 120.17, 120],
  ]);
  expect(records(store, "weight")).toEqual([["a", 90, undefined]]);
  expect(readSchemaVersion(store.personal)).toBe(SCHEMA_VERSION);
});

test("splits weight and height into a record each", () => {
  const doc = new Y.Doc();
  doc.getMap("meta").set("version", SCHEMA_VERSION - 1);
  const measurements = doc.getMap<Y.Map<unknown>>("measurements");
  const combined: [string, number, number, number][] = [
    ["c", 3, 81, 180],
    ["a", 1, 0, 180],
    ["b", 2, 80, 180],
    ["d", 4, 82, 181],
  ];
  for (const [id, createdAt, weight, height] of combined) {
    measurements.set(
      id,
      new Y.Map<unknown>([
        ["user", "user"],
        ["createdAt", createdAt],
        ["weight", weight],
        ["height", height],
      ]),
    );
  }

  migrate(doc);

  expect(
    [...measurements.values()]
      .map((m) => [m.get("type"), m.get("createdAt"), m.get("value")])
      .sort(),
  ).toEqual([
    ["height", 1, 180],
    ["height", 4, 181],
    ["weight", 2, 80],
    ["weight", 3, 81],
    ["weight", 4, 82],
  ]);
});
