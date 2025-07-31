import {
  collection,
  deleteDoc,
  doc,
  limit,
  orderBy,
  query,
  setDoc,
  type Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { firestore, firestoreQuery, useFirestoreQuery } from "./db.ts";

export interface Performance {
  id: string;
  user: string;
  workout: string;
  exercise: string;
  order: number;
  startedAt: Timestamp;
}

export function queryPerformancesByWorkout(
  user: string,
  workout: string,
): Promise<Performance[]> {
  return firestoreQuery(
    query(
      collection(firestore, "performances"),
      where("user", "==", user),
      where("workout", "==", workout),
    ),
  );
}

export function useQueryPerformancesByWorkout(
  user: string,
  workout: string,
): Performance[] {
  const docs = useFirestoreQuery<Performance>({
    query: () =>
      query(
        collection(firestore, "performances"),
        where("user", "==", user),
        where("workout", "==", workout),
      ),
    deps: [user, workout],
  });
  return [...docs].sort((a, b) => a.order - b.order);
}

export function useQueryPreviousPerformance(
  user: string,
  exercise: string,
  beforeDate: Timestamp,
): Performance | undefined {
  const docs = useFirestoreQuery<Performance>({
    query: () =>
      query(
        collection(firestore, "performances"),
        where("user", "==", user),
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

export async function updatePerformance(entity: Performance) {
  const { id, ...data } = entity;
  await updateDoc(doc(firestore, "performances", id), data);
}

export async function deletePerformance(entity: Performance) {
  await deleteDoc(doc(firestore, "performances", entity.id));
}
