import {
  collection,
  deleteEntity,
  insertEntity,
  maxBy,
  queryCollection,
  useQueryCollection,
} from "./db.ts";
import type { Store } from "./doc.ts";
import { useMemo } from "react";

export type RecordType = "one_rep_max" | "weight" | "volume" | "training_max";

export interface Record {
  id: string;
  user: string;
  workout: string;
  exercise: string;
  performance: string;
  set: string;
  createdAt: number;
  type: RecordType;
  previous: number | undefined;
  current: number;
  full: number | undefined;
  program: string | undefined;
}

export interface RecordNumbers {
  current: number;
  full: number | undefined;
  createdAt: number;
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
  program: string | undefined,
): Record[] {
  return useQueryCollection({
    collection: collection(store.personal, "records"),
    filter: {
      exercise: { eq: exercise },
      program: { eq: program },
    },
    deps: [exercise, program],
  });
}

export function queryPreviousRecordByExercise(
  store: Store,
  type: RecordType,
  exercise: string,
  program: string | undefined,
  createdAt: number,
): Record | null {
  const records = queryCollection<Record>(
    collection(store.personal, "records"),
    {
      type: { eq: type },
      exercise: { eq: exercise },
      program: { eq: program },
      createdAt: { le: createdAt },
    },
  );
  return maxBy(records, compareRecordsByDate);
}

export function useQueryPreviousRecordByExercise(
  store: Store,
  type: RecordType,
  exercise: string,
  program: string | undefined,
  createdAt: number,
): Record | null {
  const records = useQueryCollection<Record>({
    collection: collection(store.personal, "records"),
    filter: {
      type: { eq: type },
      exercise: { eq: exercise },
      program: { eq: program },
      createdAt: { le: createdAt },
    },
    deps: [type, exercise, program, createdAt],
  });
  return useMemo(() => maxBy(records, compareRecordsByDate), [records]);
}

export function addRecord(store: Store, entity: Record) {
  insertEntity(collection(store.personal, "records"), entity);
}

export function deleteRecord(store: Store, entity: Record) {
  deleteEntity(collection(store.personal, "records"), entity);
}

export function compareRecordsByValue(
  a: RecordNumbers,
  b: RecordNumbers,
): number {
  if (a.full !== undefined && b.full !== undefined) {
    return a.full - b.full;
  }

  return a.current - b.current;
}

export function compareRecordsByDate(
  a: RecordNumbers,
  b: RecordNumbers,
): number {
  return a.createdAt !== b.createdAt
    ? a.createdAt - b.createdAt
    : compareRecordsByValue(a, b);
}
