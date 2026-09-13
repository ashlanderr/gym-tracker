import {
  collection,
  deleteEntity,
  getEntity,
  insertEntity,
  useGetEntity,
  useQueryCollection,
} from "../db.ts";
import { type Store } from "../doc.ts";
import type { Exercise, ExerciseWeight, ExerciseRepRange } from "./types.ts";
import { EXERCISES } from "./constants.ts";
import { useMemo } from "react";

export const DEFAULT_EXERCISE_WEIGHT: ExerciseWeight = { type: "full" };

export const DEFAULT_EXERCISE_REPS: ExerciseRepRange = "low";

export function queryExerciseById(store: Store, id: string): Exercise | null {
  const defaultExercise = EXERCISES[id];

  const changedExercise = getEntity<Exercise>(
    collection(store.personal, "exercises"),
    id,
  );

  return changedExercise ?? defaultExercise ?? null;
}

export function useQueryExerciseById(
  store: Store,
  id: string,
): Exercise | null {
  const defaultExercise = EXERCISES[id];

  const changedExercise = useGetEntity<Exercise>({
    collection: collection(store.personal, "exercises"),
    id,
    deps: [id],
  });

  return changedExercise ?? defaultExercise ?? null;
}

export function useQueryAllExercises(store: Store): Exercise[] {
  const changedExercises = useQueryCollection<Exercise>({
    collection: collection(store.personal, "exercises"),
    filter: {},
    deps: [],
  });

  return useMemo(() => {
    const merged = new Map<string, Exercise>();

    Object.values(EXERCISES).forEach((e) => merged.set(e.id, e));
    changedExercises.forEach((e) => merged.set(e.id, e));

    return [...merged.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [changedExercises]);
}

export function addExercise(store: Store, entity: Exercise): Exercise {
  insertEntity(collection(store.personal, "exercises"), entity);
  return entity;
}

export function updateExercise(store: Store, entity: Exercise) {
  insertEntity(collection(store.personal, "exercises"), entity);
}

export function deleteExercise(store: Store, entity: Exercise) {
  deleteEntity(collection(store.personal, "exercises"), entity);
}
