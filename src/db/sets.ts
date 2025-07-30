import { firestore, useFirestoreQuery } from "./db.ts";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  query,
  updateDoc,
  where,
} from "firebase/firestore";

export type SetType = "warm-up" | "working";

export interface SetData {
  performance: string;
  order: number;
  type: SetType;
  weight: number;
  reps: number;
  completed: boolean;
}

export interface Set extends SetData {
  id: string;
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

export async function addSet(data: SetData) {
  await addDoc(collection(firestore, "sets"), data);
}

export async function updateSet(set: Set) {
  const { id, ...data } = set;
  await updateDoc(doc(firestore, "sets", id), data);
}

export async function deleteSet(set: Set) {
  await deleteDoc(doc(firestore, "sets", set.id));
}
