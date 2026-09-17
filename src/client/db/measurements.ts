import {
  collection,
  insertEntity,
  maxBy,
  minBy,
  queryCollection,
  useQueryCollection,
} from "./db.ts";
import type { Store } from "./doc.ts";

export interface Measurement {
  id: string;
  user: string;
  createdAt: number;
  weight: number;
  height: number;
}

// The latest measurement before the date, or the earliest one when the body
// was measured only later.
export function queryLatestMeasurement(
  store: Store,
  beforeDate: number | null,
): Measurement | null {
  const entities = queryCollection<Measurement>(
    collection(store.personal, "measurements"),
    {},
  );
  return selectMeasurement(entities, beforeDate);
}

export function useQueryLatestMeasurement(
  store: Store,
  beforeDate: number | null,
): Measurement | null {
  const entities = useQueryCollection<Measurement>({
    collection: collection(store.personal, "measurements"),
    filter: {},
    deps: [],
  });
  return selectMeasurement(entities, beforeDate);
}

function selectMeasurement(
  measurements: Measurement[],
  beforeDate: number | null,
): Measurement | null {
  const byDate = (a: Measurement, b: Measurement) => a.createdAt - b.createdAt;
  const before = measurements.filter(
    (m) => m.createdAt < (beforeDate ?? Infinity),
  );
  return maxBy(before, byDate) ?? minBy(measurements, byDate);
}

export function addMeasurement(store: Store, entity: Measurement): Measurement {
  insertEntity(collection(store.personal, "measurements"), entity);
  return entity;
}
