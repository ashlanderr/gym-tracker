import {
  collection,
  deleteEntity,
  insertEntity,
  useGetEntity,
  useQueryCollection,
} from "./db.ts";
import { doc } from "./doc.ts";

export interface Workout {
  id: string;
  user: string;
  name: string;
  startedAt: number;
  completedAt: number | null;
  volume?: number;
  sets?: number;
}

export function useQueryWorkoutById(id: string): Workout | null {
  return useGetEntity({
    collection: collection(doc, "workouts"),
    id,
    deps: [id],
  });
}

export function useQueryCompletedWorkouts(): Workout[] {
  const workouts = useQueryCollection<Workout>({
    collection: collection(doc, "workouts"),
    filter: {
      completedAt: { ne: null },
    },
    deps: [],
  });
  return [...workouts].sort((a, b) => b.startedAt - a.startedAt);
}

export function useQueryActiveWorkouts(): Workout[] {
  return useQueryCollection({
    collection: collection(doc, "workouts"),
    filter: {
      completedAt: { eq: null },
    },
    deps: [],
  });
}

export function addWorkout(entity: Workout): Workout {
  insertEntity(collection(doc, "workouts"), entity);
  return entity;
}

export function updateWorkout(entity: Workout) {
  insertEntity(collection(doc, "workouts"), entity);
}

export function deleteWorkout(entity: Workout) {
  deleteEntity(collection(doc, "workouts"), entity);
}
