import {
  collection,
  deleteEntity,
  getEntity,
  insertEntity,
  queryCollection,
  useGetEntity,
  useQueryCollection,
} from "./db.ts";
import type { Store } from "./doc.ts";

export interface Workout {
  id: string;
  user: string;
  name: string;
  startedAt: number;
  completedAt: number | null;
  volume?: number;
  sets?: number;
  records?: number;
  program?: string;
  repeat?: WorkoutRepeat;
}

// Repeats of one workout share the id, and the latest of them holds the
// rule: every `days` days counting from the day `from`, like "2026-10-19".
// The planned days are not stored, they follow from the rule.
export interface WorkoutRepeat {
  id: string;
  from: string;
  days: number;
}

export function queryWorkoutById(store: Store, id: string): Workout | null {
  return getEntity(collection(store.personal, "workouts"), id);
}

export function useQueryWorkoutById(store: Store, id: string): Workout | null {
  return useGetEntity({
    collection: collection(store.personal, "workouts"),
    id,
    deps: [id],
  });
}

export function useQueryCompletedWorkouts(store: Store): Workout[] {
  const workouts = useQueryCollection<Workout>({
    collection: collection(store.personal, "workouts"),
    filter: {
      completedAt: { ne: null },
    },
    deps: [],
  });
  return [...workouts].sort((a, b) => b.startedAt - a.startedAt);
}

export function queryWorkoutsByRepeat(store: Store, id: string): Workout[] {
  return queryCollection<Workout>(
    collection(store.personal, "workouts"),
    {},
  ).filter((w) => w.repeat?.id === id);
}

export function useQueryActiveWorkouts(store: Store): Workout[] {
  return useQueryCollection({
    collection: collection(store.personal, "workouts"),
    filter: {
      completedAt: { eq: null },
    },
    deps: [],
  });
}

export function addWorkout(store: Store, entity: Workout): Workout {
  insertEntity(collection(store.personal, "workouts"), entity);
  return entity;
}

export function updateWorkout(store: Store, entity: Workout): Workout {
  insertEntity(collection(store.personal, "workouts"), entity);
  return entity;
}

export function deleteWorkout(store: Store, entity: Workout) {
  deleteEntity(collection(store.personal, "workouts"), entity);
}
