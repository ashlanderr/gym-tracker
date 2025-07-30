import { firestore, useFirestoreDocument, useFirestoreQuery } from "./db.ts";
import { collection, doc, query } from "firebase/firestore";

export type MuscleType =
  | "chest"
  | "lats"
  | "biceps"
  | "triceps"
  | "shoulders"
  | "upper_back"
  | "forearms";

export interface Exercise {
  id: string;
  name: string;
  muscles: MuscleType[];
}

export function useQueryExerciseById(id: string): Exercise | undefined {
  return useFirestoreDocument({
    query: () => doc(firestore, "exercises", id),
    deps: [id],
  });
}

export function useQueryAllExercises(): Exercise[] {
  const docs = useFirestoreQuery<Exercise>({
    query: () => query(collection(firestore, "exercises")),
    deps: [],
  });
  return [...docs].sort((a, b) => a.name.localeCompare(b.name));
}
