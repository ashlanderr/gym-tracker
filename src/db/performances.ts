import {
  collection,
  doc,
  limit,
  orderBy,
  query,
  setDoc,
  type Timestamp,
  where,
} from "firebase/firestore";
import { firestore, useFirestoreQuery } from "./db.ts";

export interface Performance {
  id: string;
  user: string;
  workout: string;
  exercise: string;
  order: number;
  startedAt: Timestamp;
}

export function useQueryPerformancesByWorkout(workout: string): Performance[] {
  const docs = useFirestoreQuery<Performance>({
    query: () =>
      query(
        collection(firestore, "performances"),
        where("workout", "==", workout),
      ),
    deps: [workout],
  });
  return [...docs].sort((a, b) => a.order - b.order);
}

export function useQueryPreviousPerformance(
  exercise: string,
  beforeDate: Timestamp,
): Performance | undefined {
  const docs = useFirestoreQuery<Performance>({
    query: () =>
      query(
        collection(firestore, "performances"),
        where("exercise", "==", exercise),
        where("startedAt", "<", beforeDate),
        orderBy("startedAt", "desc"),
        limit(1),
      ),
    deps: [exercise, beforeDate],
  });
  return docs[0];
}

export async function addPerformance(entity: Performance) {
  const { id, ...data } = entity;
  await setDoc(doc(firestore, "performances", id), data);
}
