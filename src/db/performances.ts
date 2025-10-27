import {
  collection,
  deleteEntity,
  getEntity,
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
  weights?: PerformanceWeights;
  timer?: number;
  progression?: number;
}

export type WeightUnits = "kg" | "lbs";

export const DEFAULT_WEIGHT_UNITS: WeightUnits = "kg";

export interface PerformanceWeights {
  units: WeightUnits;
  base?: number;
  steps?: number | number[];
  additional?: number;
  count?: number;
}

export function queryPerformanceById(
  store: Store,
  id: string,
): Performance | null {
  return getEntity(collection(store.personal, "performances"), id);
}

export function queryPerformancesByWorkout(
  store: Store,
  workout: string,
): Performance[] {
  const performances = queryCollection<Performance>(
    collection(store.personal, "performances"),
    {
      workout: { eq: workout },
    },
  );
  return [...performances].sort((a, b) => a.order - b.order);
}

export function useQueryPerformancesByWorkout(
  store: Store,
  workout: string,
): Performance[] {
  const performances = useQueryCollection<Performance>({
    collection: collection(store.personal, "performances"),
    filter: {
      workout: { eq: workout },
    },
    deps: [workout],
  });
  return [...performances].sort((a, b) => a.order - b.order);
}

export function queryPreviousPerformance(
  store: Store,
  exercise: string,
  startedAt: number,
): Performance | null {
  const entities = queryCollection<Performance>(
    collection(store.personal, "performances"),
    {
      exercise: { eq: exercise },
      startedAt: { lt: startedAt },
    },
  );
  return maxBy(entities, (a, b) => a.startedAt - b.startedAt);
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

export function useQueryPerformancesByExercise(
  store: Store,
  exercise: string,
): Performance[] {
  return useQueryCollection({
    collection: collection(store.personal, "performances"),
    filter: {
      exercise: { eq: exercise },
    },
    deps: [exercise],
  });
}

export function addPerformance(store: Store, entity: Performance): Performance {
  insertEntity(collection(store.personal, "performances"), entity);
  return entity;
}

export function updatePerformance(
  store: Store,
  entity: Performance,
): Performance {
  insertEntity(collection(store.personal, "performances"), entity);
  return entity;
}

export function deletePerformance(store: Store, entity: Performance) {
  deleteEntity(collection(store.personal, "performances"), entity);
}
