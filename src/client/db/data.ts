import { useMemo } from "react";
import { collection, queryCollection, useQueryCollection } from "./db.ts";
import type { Store } from "./doc.ts";
import type { Record } from "./records.ts";

// Everything a workout leaves behind. Profile, measurements, the gym and
// edited exercises are about the person and the place, not the training.
export const HISTORY_COLLECTIONS = [
  "workouts",
  "performances",
  "sets",
  "records",
] as const;

export const ALL_COLLECTIONS = [
  ...HISTORY_COLLECTIONS,
  "measurements",
  "profiles",
  "gyms",
  "exercises",
] as const;

export type CollectionName = (typeof ALL_COLLECTIONS)[number];

// What the danger zone counts before it deletes: the numbers the person
// recognises, so completed sets rather than planned ones.
export interface DataSummary {
  workouts: number;
  sets: number;
  records: number;
  recordExercises: number;
  measurements: number;
}

interface Entity {
  id: string;
}

const COMPLETED = { completed: { eq: true } };

export function queryDataSummary(store: Store): DataSummary {
  const query = <E extends Entity>(name: CollectionName, filter = {}) =>
    queryCollection<E>(collection(store.personal, name), filter);
  return summarize(
    query("workouts"),
    query("sets", COMPLETED),
    query<Record>("records"),
    query("measurements"),
  );
}

export function useQueryDataSummary(store: Store): DataSummary {
  const workouts = useCollection(store, "workouts");
  const sets = useCollection(store, "sets", COMPLETED);
  const records = useCollection<Record>(store, "records");
  const measurements = useCollection(store, "measurements");
  return useMemo(
    () => summarize(workouts, sets, records, measurements),
    [workouts, sets, records, measurements],
  );
}

function useCollection<E extends Entity>(
  store: Store,
  name: CollectionName,
  filter = {},
): E[] {
  return useQueryCollection<E>({
    collection: collection(store.personal, name),
    filter,
    deps: [],
  });
}

function summarize(
  workouts: Entity[],
  sets: Entity[],
  records: Record[],
  measurements: Entity[],
): DataSummary {
  return {
    workouts: workouts.length,
    sets: sets.length,
    records: records.length,
    recordExercises: new Set(records.map((r) => r.exercise)).size,
    measurements: measurements.length,
  };
}

// One transaction, so a synced device never sees half of a deletion.
export function clearCollections(
  store: Store,
  names: readonly CollectionName[],
) {
  store.personal.transact(() => {
    for (const name of names) collection(store.personal, name).clear();
  });
}
