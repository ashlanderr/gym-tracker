import type { Store } from "./doc.ts";
import {
  collection,
  deleteEntity,
  insertEntity,
  queryCollection,
  useQueryCollection,
} from "./db.ts";

export type PeriodizationMode = "light" | "medium" | "heavy";

export interface PeriodizationData {
  counter: number;
  light: number;
  medium: number;
  heavy: number;
}

export interface Periodization {
  id: string;
  user: string;
  counter: number;
  light: number;
  medium: number;
  heavy: number;
}

export function queryPeriodizationByUser(
  store: Store,
  user: string,
): Periodization | null {
  const [periodization] = queryCollection<Periodization>(
    collection(store.personal, "periodizations"),
    { user: { eq: user } },
  );
  return periodization ?? null;
}

export function useQueryPeriodizationByUser(
  store: Store,
  user: string,
): Periodization | null {
  const [periodization] = useQueryCollection<Periodization>({
    collection: collection(store.personal, "periodizations"),
    filter: { user: { eq: user } },
    deps: [user],
  });
  return periodization ?? null;
}

export function addPeriodization(
  store: Store,
  entity: Periodization,
): Periodization {
  insertEntity(collection(store.personal, "periodizations"), entity);
  return entity;
}

export function updatePeriodization(
  store: Store,
  entity: Periodization,
): Periodization {
  insertEntity(collection(store.personal, "periodizations"), entity);
  return entity;
}

export function deletePeriodization(store: Store, entity: Periodization) {
  deleteEntity(collection(store.personal, "periodizations"), entity);
}
