import { firestore, firestoreQuery, useFirestoreQuery } from "./db.ts";
import {
  collection,
  deleteDoc,
  doc,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

export type SetType = "warm-up" | "working";

export interface Set {
  id: string;
  workout: string;
  performance: string;
  order: number;
  type: SetType;
  weight: number;
  reps: number;
  completed: boolean;
}

export interface QuerySetByPerformanceRequest {
  enabled?: boolean;
  performance: string | undefined;
}

export function useQuerySetsByPerformance({
  enabled,
  performance,
}: QuerySetByPerformanceRequest): Set[] {
  const docs = useFirestoreQuery<Set>({
    query: () =>
      query(
        collection(firestore, "sets"),
        where("performance", "==", performance),
      ),
    enabled,
    deps: [performance],
  });
  return [...docs].sort((a, b) => a.order - b.order);
}

export function querySetsByWorkout(workout: string): Promise<Set[]> {
  return firestoreQuery(
    query(collection(firestore, "sets"), where("workout", "==", workout)),
  );
}

export function useQuerySetsByWorkout(workout: string): Set[] {
  return useFirestoreQuery({
    query: () =>
      query(collection(firestore, "sets"), where("workout", "==", workout)),
    deps: [workout],
  });
}

export async function addSet(entity: Set) {
  const { id, ...data } = entity;
  await setDoc(doc(firestore, "sets", id), data);
}

export async function updateSet(set: Set) {
  const { id, ...data } = set;
  await updateDoc(doc(firestore, "sets", id), data);
}

export async function deleteSet(set: Set) {
  await deleteDoc(doc(firestore, "sets", set.id));
}
