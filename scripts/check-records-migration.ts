// Runs the migration of the data on a saved document and prints how the
// records of 1RM change. The file is only read.
//
//   npx vite-node scripts/check-records-migration.ts -- dumps/doc.bin
import { readFileSync } from "node:fs";
import * as Y from "yjs";
import { queryExerciseById, type Record, readSchemaVersion } from "../src/db";
import { migrateData, SCHEMA_VERSION } from "../src/domain";

const [file] = process.argv.slice(2).filter((a) => a !== "--");
if (!file) {
  console.error("usage: check-records-migration <document file>");
  process.exit(1);
}

const doc = new Y.Doc();
Y.applyUpdate(doc, readFileSync(file));
const store = { personal: doc, hasServer: false };

const before = oneRepMaxRecords();
const version = readSchemaVersion(doc);
migrateData(doc);
const after = oneRepMaxRecords();

console.log(
  `version ${version} → ${readSchemaVersion(doc)} (${SCHEMA_VERSION})`,
);
console.log(`records of 1RM: ${before.length} → ${after.length}\n`);

const exercises = new Set([...before, ...after].map((r) => r.exercise));
for (const exercise of exercises) {
  const name = queryExerciseById(store, exercise)?.name ?? exercise;
  const old = before.filter((r) => r.exercise === exercise).map(format);
  const now = after.filter((r) => r.exercise === exercise).map(format);
  const same = old.join() === now.join();
  console.log(`${same ? " " : "*"} ${name}`);
  if (same) continue;
  console.log(`    было:  ${old.join("  ")}`);
  console.log(`    стало: ${now.join("  ")}`);
}

function oneRepMaxRecords(): Record[] {
  return [...doc.getMap<Y.Map<unknown>>("records").values()]
    .map((r) => r.toJSON() as Record)
    .filter((r) => r.type === "one_rep_max")
    .sort((a, b) => a.createdAt - b.createdAt);
}

function format(r: Record): string {
  const date = new Date(r.createdAt).toISOString().slice(0, 10);
  return `${date} ${Math.round((r.full ?? r.current) * 10) / 10}`;
}
