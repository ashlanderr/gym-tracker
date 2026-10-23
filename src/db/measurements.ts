import { useMemo } from "react";
import {
  collection,
  deleteEntity,
  insertEntity,
  maxBy,
  queryCollection,
  useQueryCollection,
} from "./db.ts";
import type { Store } from "./doc.ts";

// Weight in kilograms, the rest in centimetres. A new kind of measurement is
// a new type, not a new collection.
export type MeasurementType =
  | "weight"
  | "height"
  | "waist"
  | "chest"
  | "hips"
  | "biceps";

export interface Measurement {
  id: string;
  user: string;
  type: MeasurementType;
  value: number;
  createdAt: number;
}

export function queryLatestMeasurement(
  store: Store,
  type: MeasurementType,
  beforeDate: number | null,
): Measurement | null {
  const entities = queryCollection<Measurement>(
    collection(store.personal, "measurements"),
    {
      type: { eq: type },
      createdAt: { lt: beforeDate ?? Infinity },
    },
  );
  return maxBy(entities, (a, b) => a.createdAt - b.createdAt);
}

export function useQueryLatestMeasurement(
  store: Store,
  type: MeasurementType,
  beforeDate: number | null,
): Measurement | null {
  const entities = useQueryCollection<Measurement>({
    collection: collection(store.personal, "measurements"),
    filter: {
      type: { eq: type },
      createdAt: { lt: beforeDate ?? Infinity },
    },
    deps: [type, beforeDate],
  });
  return maxBy(entities, (a, b) => a.createdAt - b.createdAt);
}

// Every measurement, newest first: the history reads down from today.
export function useQueryMeasurements(store: Store): Measurement[] {
  const entities = useQueryCollection<Measurement>({
    collection: collection(store.personal, "measurements"),
    filter: {},
    deps: [],
  });
  return useMemo(
    () => [...entities].sort((a, b) => b.createdAt - a.createdAt),
    [entities],
  );
}

export function addMeasurement(store: Store, entity: Measurement): Measurement {
  insertEntity(collection(store.personal, "measurements"), entity);
  return entity;
}

export function deleteMeasurement(store: Store, entity: Measurement) {
  deleteEntity(collection(store.personal, "measurements"), entity);
}
