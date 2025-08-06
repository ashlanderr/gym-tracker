import {
  collection,
  deleteEntity,
  getEntity,
  insertEntity,
  useGetEntity,
  useQueryCollection,
} from "./db.ts";
import { type Store } from "./doc.ts";

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

export type EquipmentType =
  | "none"
  | "barbell"
  | "dumbbell"
  | "machine"
  | "plates";

export interface Exercise {
  id: string;
  name: string;
  muscles: MuscleType[];
  equipment?: EquipmentType;
}

export function queryExerciseById(store: Store, id: string): Exercise | null {
  return getEntity(collection(store.shared, "exercises"), id);
}

export function useQueryExerciseById(
  store: Store,
  id: string,
): Exercise | null {
  return useGetEntity({
    collection: collection(store.shared, "exercises"),
    id,
    deps: [id],
  });
}

export function useQueryAllExercises(store: Store): Exercise[] {
  const entities = useQueryCollection<Exercise>({
    collection: collection(store.shared, "exercises"),
    filter: {},
    deps: [],
  });
  return [...entities].sort((a, b) => a.name.localeCompare(b.name));
}

export function addExercise(store: Store, entity: Exercise): Exercise {
  insertEntity(collection(store.shared, "exercises"), entity);
  return entity;
}

export function updateExercise(store: Store, entity: Exercise) {
  insertEntity(collection(store.shared, "exercises"), entity);
}

export function deleteExercise(store: Store, entity: Exercise) {
  deleteEntity(collection(store.shared, "exercises"), entity);
}
