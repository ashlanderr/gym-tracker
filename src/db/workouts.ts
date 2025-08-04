import {
  collection,
  deleteEntity,
  insertEntity,
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

export function updateWorkout(store: Store, entity: Workout) {
  insertEntity(collection(store.personal, "workouts"), entity);
}

export function deleteWorkout(store: Store, entity: Workout) {
  deleteEntity(collection(store.personal, "workouts"), entity);
}
