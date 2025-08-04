import {
  collection,
  insertEntity,
  useGetEntity,
  useQueryCollection,
} from "./db.ts";
import { doc } from "./doc.ts";

export type MuscleType =
  | "abs"
  | "abductors"
  | "adductors"
  | "biceps"
  | "calves"
  | "chest"
  | "forearms"
  | "glutes"
  | "hamstrings"
  | "lats"
  | "lower_back"
  | "neck"
  | "quadriceps"
  | "shoulders"
  | "traps"
  | "triceps"
  | "upper_back";

export interface Exercise {
  id: string;
  name: string;
  muscles: MuscleType[];
}

export function useQueryExerciseById(id: string): Exercise | null {
  return useGetEntity({
    collection: collection(doc, "exercises"),
    id,
    deps: [id],
  });
}

export function useQueryAllExercises(): Exercise[] {
  const entities = useQueryCollection<Exercise>({
    collection: collection(doc, "exercises"),
    filter: {},
    deps: [],
  });
  return [...entities].sort((a, b) => a.name.localeCompare(b.name));
}

export function addExercise(entity: Exercise): Exercise {
  insertEntity(collection(doc, "exercises"), entity);
  return entity;
}
