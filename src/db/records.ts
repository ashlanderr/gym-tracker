import {
  collection,
  deleteEntity,
  insertEntity,
  maxBy,
  queryCollection,
  useQueryCollection,
} from "./db.ts";
import type { Store } from "./doc.ts";

export type RecordType = "one_rep_max" | "weight" | "volume";

export interface Record {
  id: string;
  user: string;
  workout: string;
  exercise: string;
  performance: string;
  set: string;
  createdAt: number;
  type: RecordType;
  previous: number;
  current: number;
}

export function queryRecordsByWorkout(store: Store, workout: string): Record[] {
  return queryCollection(collection(store.personal, "records"), {
    workout: { eq: workout },
  });
}

export function queryRecordsByPerformance(
  store: Store,
  performance: string,
): Record[] {
  return queryCollection(collection(store.personal, "records"), {
    performance: { eq: performance },
  });
}

export function useQueryRecordsBySet(store: Store, set: string): Record[] {
  return useQueryCollection({
    collection: collection(store.personal, "records"),
    filter: {
      set: { eq: set },
    },
    deps: [set],
  });
}

export function useQueryRecordsByExercise(
  store: Store,
  exercise: string,
): Record[] {
  return useQueryCollection({
    collection: collection(store.personal, "records"),
    filter: {
      exercise: { eq: exercise },
    },
    deps: [exercise],
  });
}

export function queryPreviousRecordByExercise(
  store: Store,
  type: RecordType,
  exercise: string,
  createdAt: number,
): Record | null {
  const records = queryCollection<Record>(
    collection(store.personal, "records"),
    {
      type: { eq: type },
      exercise: { eq: exercise },
      createdAt: { le: createdAt },
    },
  );
  return maxBy(records, (a, b) => a.current - b.current);
}

export function addRecord(store: Store, entity: Record) {
  insertEntity(collection(store.personal, "records"), entity);
}

export function deleteRecord(store: Store, entity: Record) {
  deleteEntity(collection(store.personal, "records"), entity);
}
