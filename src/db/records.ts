import {
  collection,
  deleteEntity,
  insertEntity,
  maxBy,
  queryCollection,
  useQueryCollection,
} from "./db.ts";
import { doc } from "./doc.ts";

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

export function queryRecordsByWorkout(workout: string): Record[] {
  return queryCollection(collection(doc, "records"), {
    workout: { eq: workout },
  });
}

export function queryRecordsByPerformance(performance: string): Record[] {
  return queryCollection(collection(doc, "records"), {
    performance: { eq: performance },
  });
}

export function useQueryRecordsBySet(set: string): Record[] {
  return useQueryCollection({
    collection: collection(doc, "records"),
    filter: {
      set: { eq: set },
    },
    deps: [set],
  });
}

export function queryLatestRecordByExercise(
  type: RecordType,
  exercise: string,
): Record | null {
  const records = queryCollection<Record>(collection(doc, "records"), {
    type: { eq: type },
    exercise: { eq: exercise },
  });
  return maxBy(records, (a, b) => a.createdAt - b.createdAt);
}

export function addRecord(entity: Record) {
  insertEntity(collection(doc, "records"), entity);
}

export function deleteRecord(entity: Record) {
  deleteEntity(collection(doc, "records"), entity);
}
