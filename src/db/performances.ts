import {
  collection,
  deleteEntity,
  insertEntity,
  maxBy,
  queryCollection,
  useQueryCollection,
} from "./db.ts";
import { doc } from "./doc.ts";

export interface Performance {
  id: string;
  user: string;
  workout: string;
  exercise: string;
  order: number;
  startedAt: number;
}

export function queryPerformancesByWorkout(workout: string): Performance[] {
  return queryCollection(collection(doc, "performances"), {
    workout: { eq: workout },
  });
}

export function useQueryPerformancesByWorkout(workout: string): Performance[] {
  return useQueryCollection({
    collection: collection(doc, "performances"),
    filter: {
      workout: { eq: workout },
    },
    deps: [workout],
  });
}

export function useQueryPreviousPerformance(
  exercise: string,
  startedAt: number,
): Performance | null {
  const entities = useQueryCollection<Performance>({
    collection: collection(doc, "performances"),
    filter: {
      exercise: { eq: exercise },
      startedAt: { lt: startedAt },
    },
    deps: [exercise],
  });
  return maxBy(entities, (a, b) => a.startedAt - b.startedAt);
}

export function addPerformance(entity: Performance): Performance {
  insertEntity(collection(doc, "performances"), entity);
  return entity;
}

export function updatePerformance(entity: Performance) {
  insertEntity(collection(doc, "performances"), entity);
}

export function deletePerformance(entity: Performance) {
  deleteEntity(collection(doc, "performances"), entity);
}
