import { doc } from "./doc.ts";
import {
  collection,
  deleteEntity,
  insertEntity,
  queryCollection,
  useQueryCollection,
} from "./db.ts";

export type SetType = "warm-up" | "working";

export interface Set {
  id: string;
  user: string;
  workout: string;
  exercise: string;
  performance: string;
  order: number;
  type: SetType;
  weight: number;
  reps: number;
  completed: boolean;
}

export function querySetsByWorkout(workout: string): Set[] {
  return queryCollection(collection(doc, "sets"), {
    workout: { eq: workout },
  });
}

export function useQuerySetsByWorkout(workout: string): Set[] {
  return useQueryCollection({
    collection: collection(doc, "sets"),
    filter: { workout: { eq: workout } },
    deps: [workout],
  });
}

export function querySetsByPerformance(performance: string): Set[] {
  return queryCollection(collection(doc, "sets"), {
    performance: { eq: performance },
  });
}

export function useQuerySetsByPerformance(performance: string): Set[] {
  return useQueryCollection({
    collection: collection(doc, "sets"),
    filter: { performance: { eq: performance } },
    deps: [performance],
  });
}

export function addSet(entity: Set): Set {
  insertEntity(collection(doc, "sets"), entity);
  return entity;
}

export function updateSet(entity: Set) {
  insertEntity(collection(doc, "sets"), entity);
}

export function deleteSet(entity: Set) {
  deleteEntity(collection(doc, "sets"), entity);
}
