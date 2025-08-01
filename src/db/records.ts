import {
  collection,
  deleteDoc,
  doc,
  limit,
  orderBy,
  query,
  setDoc,
  type Timestamp,
  where,
} from "firebase/firestore";
import { firestore, firestoreQuery, useFirestoreQuery } from "./db.ts";

export type RecordType = "one_rep_max" | "weight" | "volume";

export interface Record {
  id: string;
  user: string;
  workout: string;
  exercise: string;
  performance: string;
  set: string;
  createdAt: Timestamp;
  type: RecordType;
  previous: number;
  current: number;
}

export interface QueryLatestRecordByExercise {
  user: string;
  exercise: string;
  type: RecordType;
}

export async function queryLatestRecordByExercise({
  user,
  exercise,
  type,
}: QueryLatestRecordByExercise): Promise<Record | undefined> {
  const docs = await firestoreQuery<Record>(
    query(
      collection(firestore, "records"),
      where("user", "==", user),
      where("exercise", "==", exercise),
      where("type", "==", type),
      orderBy("createdAt", "desc"),
      limit(1),
    ),
  );
  return docs[0];
}

export async function queryRecordsByPerformance(
  user: string,
  performance: string,
): Promise<Record[]> {
  return firestoreQuery<Record>(
    query(
      collection(firestore, "records"),
      where("user", "==", user),
      where("performance", "==", performance),
    ),
  );
}

export async function queryRecordsByWorkout(
  user: string,
  workout: string,
): Promise<Record[]> {
  return firestoreQuery<Record>(
    query(
      collection(firestore, "records"),
      where("user", "==", user),
      where("workout", "==", workout),
    ),
  );
}

export function useQueryRecordsBySet(user: string, set: string): Record[] {
  return useFirestoreQuery({
    query: () =>
      query(
        collection(firestore, "records"),
        where("user", "==", user),
        where("set", "==", set),
      ),
    deps: [user, set],
  });
}

export async function addRecord(entity: Record) {
  const { id, ...data } = entity;
  await setDoc(doc(firestore, "records", id), data);
}

export async function deleteRecord(entity: Record) {
  await deleteDoc(doc(firestore, "records", entity.id));
}
