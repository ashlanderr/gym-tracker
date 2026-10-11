import * as Y from "yjs";
import { migrate, readSchemaVersion } from "./migrations.ts";

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
