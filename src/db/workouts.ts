import {
  collection,
  doc,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { firestore, useFirestoreDocument, useFirestoreQuery } from "./db.ts";

export interface Workout {
  id: string;
  user: string;
  name: string;
  startedAt: Timestamp;
  completedAt: Timestamp | null;
}

export function useQueryWorkoutById(id: string): Workout | undefined {
  return useFirestoreDocument({
    query: () => doc(firestore, "workouts", id),
    deps: [id],
  });
}

export function useQueryWorkoutsByUser(user: string): Workout[] {
  return useFirestoreQuery({
    query: () =>
      query(
        collection(firestore, "workouts"),
        where("user", "==", user),
        orderBy("startedAt", "desc"),
      ),
    deps: [user],
  });
}

export async function updateWorkout(entity: Workout) {
  const { id, ...data } = entity;
  await updateDoc(doc(firestore, "workouts", id), data);
}
