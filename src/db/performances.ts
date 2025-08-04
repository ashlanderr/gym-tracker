import {
  collection,
  deleteEntity,
  insertEntity,
  maxBy,
  queryCollection,
  useQueryCollection,
} from "./db.ts";
import type { Store } from "./doc.ts";

export interface Performance {
  id: string;
  user: string;
  workout: string;
  exercise: string;
  order: number;
  startedAt: number;
}

export function queryPerformancesByWorkout(
  store: Store,
  workout: string,
): Performance[] {
  return queryCollection(collection(store.personal, "performances"), {
    workout: { eq: workout },
  });
}

export function useQueryPerformancesByWorkout(
  store: Store,
  workout: string,
): Performance[] {
  return useQueryCollection({
    collection: collection(store.personal, "performances"),
    filter: {
      workout: { eq: workout },
    },
    deps: [workout],
  });
}

export function useQueryPreviousPerformance(
  store: Store,
  exercise: string,
  startedAt: number,
): Performance | null {
  const entities = useQueryCollection<Performance>({
    collection: collection(store.personal, "performances"),
    filter: {
      exercise: { eq: exercise },
      startedAt: { lt: startedAt },
    },
    deps: [exercise],
  });
  return maxBy(entities, (a, b) => a.startedAt - b.startedAt);
}

export function addPerformance(store: Store, entity: Performance): Performance {
  insertEntity(collection(store.personal, "performances"), entity);
  return entity;
}

export function updatePerformance(store: Store, entity: Performance) {
  insertEntity(collection(store.personal, "performances"), entity);
}

export function deletePerformance(store: Store, entity: Performance) {
  deleteEntity(collection(store.personal, "performances"), entity);
}
