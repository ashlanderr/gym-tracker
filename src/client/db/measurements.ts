import {
  collection,
  insertEntity,
  maxBy,
  minBy,
  queryCollection,
  useQueryCollection,
} from "./db.ts";
import type { Store } from "./doc.ts";

// Weight in kilograms, height in centimetres. A new kind of measurement is a
// new type, not a new collection.
export type MeasurementType = "weight" | "height";

export interface Measurement {
  id: string;
  user: string;
  type: MeasurementType;
  value: number;
  createdAt: number;
}

// The latest measurement at the date, or the earliest one when the body was
// measured only later. A measurement taken at the very moment counts: the
// onboarding writes body weight and a remembered set together.
export function queryLatestMeasurement(
  store: Store,
  type: MeasurementType,
  atDate: number | null,
): Measurement | null {
  const entities = queryCollection<Measurement>(
    collection(store.personal, "measurements"),
    { type: { eq: type } },
  );
  return selectMeasurement(entities, atDate);
}

export function useQueryLatestMeasurement(
  store: Store,
  type: MeasurementType,
  atDate: number | null,
): Measurement | null {
  const entities = useQueryCollection<Measurement>({
    collection: collection(store.personal, "measurements"),
    filter: { type: { eq: type } },
    deps: [type],
  });
  return selectMeasurement(entities, atDate);
}

function selectMeasurement(
  measurements: Measurement[],
  atDate: number | null,
): Measurement | null {
  const byDate = (a: Measurement, b: Measurement) => a.createdAt - b.createdAt;
  const before = measurements.filter(
    (m) => m.createdAt <= (atDate ?? Infinity),
  );
  return maxBy(before, byDate) ?? minBy(measurements, byDate);
}

export function addMeasurement(store: Store, entity: Measurement): Measurement {
  insertEntity(collection(store.personal, "measurements"), entity);
  return entity;
}
