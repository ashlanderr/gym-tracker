import * as Y from "yjs";
import {
  mergeSetTypesIntoWorking,
  migrate,
  readSchemaVersion,
  replaceRepPresetsWithRanges,
} from "./migrations.ts";

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
  mergeSetTypesIntoWorking(doc);
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
  replaceRepPresetsWithRanges(doc);
  expect([...exercises.values()].map((e) => e.get("reps"))).toEqual([
    { min: 6, max: 8 },
    { min: 8, max: 12 },
    { min: 12, max: 15 },
    custom,
    undefined,
  ]);
});
