import * as Y from "yjs";
import {
  migrate,
  type Migration,
  mergeSetTypesIntoWorking,
  replaceRepPresetsWithRanges,
} from "../db";
import { rebuildOneRepMaxRecords } from "./records.ts";

const MIGRATIONS: Migration[] = [
  mergeSetTypesIntoWorking,
  replaceRepPresetsWithRanges,
  (doc) => rebuildOneRepMaxRecords({ personal: doc, hasServer: false }),
];

export const SCHEMA_VERSION = MIGRATIONS.length;

export function migrateData(doc: Y.Doc) {
  migrate(doc, MIGRATIONS);
}
