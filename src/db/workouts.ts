import {
  collection,
  deleteDoc,
  doc,
  orderBy,
  query,
  setDoc,
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
  volume?: number;
  sets?: number;
}

export function useQueryWorkoutById(id: string): Workout | undefined {
  return useFirestoreDocument({
    query: () => doc(firestore, "workouts", id),
    deps: [id],
  });
}

export function useQueryCompletedWorkoutsByUser(user: string): Workout[] {
  return useFirestoreQuery({
    query: () =>
      query(
        collection(firestore, "workouts"),
        where("user", "==", user),
        where("completedAt", "!=", null),
        orderBy("completedAt", "desc"),
      ),
    deps: [user],
  });
}

export function useQueryActiveWorkoutsByUser(user: string): Workout[] {
  return useFirestoreQuery({
    query: () =>
      query(
        collection(firestore, "workouts"),
        where("user", "==", user),
        where("completedAt", "==", null),
      ),
    deps: [user],
  });
}

export async function addWorkout(entity: Workout) {
  const { id, ...data } = entity;
  await setDoc(doc(firestore, "workouts", id), data);
}

export async function updateWorkout(entity: Workout) {
  const { id, ...data } = entity;
  await updateDoc(doc(firestore, "workouts", id), data);
}

export async function deleteWorkout(entity: Workout) {
  await deleteDoc(doc(firestore, "workouts", entity.id));
}
