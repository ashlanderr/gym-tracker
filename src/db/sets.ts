import {
  collection,
  deleteEntity,
  insertEntity,
  queryCollection,
  useQueryCollection,
} from "./db.ts";
import type { Store } from "./doc.ts";

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

export function querySetsByWorkout(store: Store, workout: string): Set[] {
  return queryCollection(collection(store.personal, "sets"), {
    workout: { eq: workout },
  });
}

export function useQuerySetsByWorkout(store: Store, workout: string): Set[] {
  return useQueryCollection({
    collection: collection(store.personal, "sets"),
    filter: { workout: { eq: workout } },
    deps: [workout],
  });
}

export function querySetsByPerformance(
  store: Store,
  performance: string,
): Set[] {
  const sets = queryCollection<Set>(collection(store.personal, "sets"), {
    performance: { eq: performance },
  });
  return [...sets].sort((a, b) => a.order - b.order);
}

export function useQuerySetsByPerformance(
  store: Store,
  performance: string,
): Set[] {
  const sets = useQueryCollection<Set>({
    collection: collection(store.personal, "sets"),
    filter: { performance: { eq: performance } },
    deps: [performance],
  });
  return [...sets].sort((a, b) => a.order - b.order);
}

export function addSet(store: Store, entity: Set): Set {
  insertEntity(collection(store.personal, "sets"), entity);
  return entity;
}

export function updateSet(store: Store, entity: Set) {
  insertEntity(collection(store.personal, "sets"), entity);
}

export function deleteSet(store: Store, entity: Set) {
  deleteEntity(collection(store.personal, "sets"), entity);
}
