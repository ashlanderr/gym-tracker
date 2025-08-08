import { collection, insertEntity, maxBy, useQueryCollection } from "./db.ts";
import type { Store } from "./doc.ts";

export interface Measurement {
  id: string;
  user: string;
  createdAt: number;
  weight: number;
  height: number;
}

export function useQueryLatestMeasurement(
  store: Store,
  beforeDate: number | null,
): Measurement | null {
  const entities = useQueryCollection<Measurement>({
    collection: collection(store.personal, "measurements"),
    filter: {
      createdAt: { lt: beforeDate ?? Infinity },
    },
    deps: [beforeDate],
  });
  return maxBy(entities, (a, b) => a.createdAt - b.createdAt);
}

export function addMeasurement(store: Store, entity: Measurement): Measurement {
  insertEntity(collection(store.personal, "measurements"), entity);
  return entity;
}
