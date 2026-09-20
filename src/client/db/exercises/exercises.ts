import {
  collection,
  deleteEntity,
  getEntity,
  insertEntity,
  useGetEntity,
  useQueryCollection,
} from "../db.ts";
import { type Store } from "../doc.ts";
import type { Exercise, MuscleType } from "./types.ts";
import { EXERCISES } from "./constants.ts";
import { useMemo } from "react";

export function getExerciseMuscles(exercise: Exercise): MuscleType[] {
  return [...exercise.primaryMuscles, ...exercise.secondaryMuscles];
}

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

// Browsing order, unlike the alphabetical list: the built-in catalog keeps
// variations of one movement next to each other, which is what someone
// flipping through the exercises one by one expects. Everything the user has
// added goes after it, by name.
export function useQueryCatalogExercises(store: Store): Exercise[] {
  const changedExercises = useQueryCollection<Exercise>({
    collection: collection(store.personal, "exercises"),
    filter: {},
    deps: [],
  });

  return useMemo(() => {
    const order = Object.keys(EXERCISES);
    const merged = new Map<string, Exercise>();

    Object.values(EXERCISES).forEach((e) => merged.set(e.id, e));
    changedExercises.forEach((e) => merged.set(e.id, e));

    const isCustom = (e: Exercise) => !order.includes(e.id);

    return [...merged.values()].sort((a, b) => {
      if (isCustom(a) && isCustom(b)) return a.name.localeCompare(b.name);
      if (isCustom(a)) return 1;
      if (isCustom(b)) return -1;
      return order.indexOf(a.id) - order.indexOf(b.id);
    });
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
