import * as Y from "yjs";
import { useEffect, useState } from "react";
import type { Store } from "./doc.ts";
import { collection } from "./db.ts";

type Migration = (doc: Y.Doc) => void;

// The migration at index i moves the data from version i to i + 1.
const MIGRATIONS: Migration[] = [mergeSetTypesIntoWorking];

function mergeSetTypesIntoWorking(doc: Y.Doc) {
  for (const set of collection(doc, "sets").values()) {
    const type = set.get("type");
    if (type === "failure" || type === "light") set.set("type", "working");
  }
}

export const SCHEMA_VERSION = MIGRATIONS.length;

const VERSION_KEY = "version";

function meta(doc: Y.Doc): Y.Map<unknown> {
  return doc.getMap("meta");
}

export function readSchemaVersion(doc: Y.Doc): number {
  const version = meta(doc).get(VERSION_KEY);
  return typeof version === "number" ? version : 0;
}

export function useSchemaVersion(store: Store): number {
  const [version, setVersion] = useState(() =>
    readSchemaVersion(store.personal),
  );

  useEffect(() => {
    const map = meta(store.personal);
    const observer = () => setVersion(readSchemaVersion(store.personal));
    observer();
    map.observe(observer);
    return () => map.unobserve(observer);
  }, [store]);

  return version;
}

export function migrate(doc: Y.Doc, migrations: Migration[] = MIGRATIONS) {
  const from = readSchemaVersion(doc);
  if (from >= migrations.length) return;

  doc.transact(() => {
    for (let v = from; v < migrations.length; ++v) {
      migrations[v](doc);
    }
    meta(doc).set(VERSION_KEY, migrations.length);
  });
}
