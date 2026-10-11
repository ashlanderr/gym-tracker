import * as Y from "yjs";
import { useEffect, useState } from "react";
import type { Store } from "./doc.ts";
import { collection, generateId, insertEntity } from "./db.ts";

type Migration = (doc: Y.Doc) => void;

// The migration at index i moves the data from version i to i + 1.
const MIGRATIONS: Migration[] = [
  mergeSetTypesIntoWorking,
  replaceRepPresetsWithRanges,
  rebuildOneRepMaxRecordsByEpley,
];

const REP_PRESETS: Record<string, { min: number; max: number }> = {
  low: { min: 6, max: 8 },
  medium: { min: 8, max: 12 },
  high: { min: 12, max: 15 },
};

function mergeSetTypesIntoWorking(doc: Y.Doc) {
  for (const set of collection(doc, "sets").values()) {
    const type = set.get("type");
    if (type === "failure" || type === "light") set.set("type", "working");
  }
}

function replaceRepPresetsWithRanges(doc: Y.Doc) {
  for (const exercise of collection(doc, "exercises").values()) {
    const reps = exercise.get("reps");
    if (typeof reps === "string" && reps in REP_PRESETS) {
      exercise.set("reps", REP_PRESETS[reps]);
    }
  }
}

// Records of 1RM by Epley for any reps instead of Brzycki under 10. A formula
// changes which sets were records, so they are built again from the sets, the
// oldest performance first, the way they were added when a set was done.
// Everything it reads from the app is copied below as it was then.
function rebuildOneRepMaxRecordsByEpley(doc: Y.Doc) {
  const records = collection(doc, "records");
  for (const [id, record] of [...records.entries()]) {
    if (record.get("type") === "one_rep_max") records.delete(id);
  }

  const workouts = collection(doc, "workouts");
  const exercises = collection(doc, "exercises");
  const sets = values<SetV3>(doc, "sets");
  const measurements = values<MeasurementV3>(doc, "measurements");
  const performances = values<PerformanceV3>(doc, "performances").sort(
    (a, b) => a.startedAt - b.startedAt,
  );

  for (const performance of performances) {
    if (!workouts.has(performance.workout)) continue;

    const weight: ExerciseWeightV3 = exercises
      .get(performance.exercise)
      ?.get("weight") ??
      BODY_WEIGHT_EXERCISES_V3[performance.exercise] ?? { type: "full" };
    const selfWeight = latest(
      measurements.filter((m) => m.createdAt < performance.startedAt),
    )?.weight;

    const candidates = sets
      .filter((s) => s.performance === performance.id)
      .filter((s) => s.completed && s.type !== "warm-up")
      .sort((a, b) => a.order - b.order)
      .map((s) => ({
        set: s.id,
        current: epley(s.weight, s.reps),
        full: epley(fullWeight(weight, selfWeight, s.weight), s.reps),
        createdAt: performance.startedAt,
      }));
    const best = maxBy(candidates, byValue);
    if (!best) continue;

    const previous = maxBy(
      values<RecordV3>(doc, "records").filter(
        (r) =>
          r.type === "one_rep_max" &&
          r.exercise === performance.exercise &&
          r.program === performance.program &&
          r.createdAt <= performance.startedAt,
      ),
      (a, b) => a.createdAt - b.createdAt || byValue(a, b),
    );
    if (previous && byValue(best, previous) <= 0) continue;

    insertEntity(records, {
      id: generateId(),
      user: performance.user,
      workout: performance.workout,
      exercise: performance.exercise,
      performance: performance.id,
      set: best.set,
      createdAt: performance.startedAt,
      type: "one_rep_max",
      previous: previous?.current,
      current: best.current,
      full: best.full,
      program: performance.program,
    });
  }
}

interface PerformanceV3 {
  id: string;
  user: string;
  workout: string;
  exercise: string;
  startedAt: number;
  program: string | undefined;
}

interface SetV3 {
  id: string;
  performance: string;
  order: number;
  type: string;
  completed: boolean;
  weight: number;
  reps: number;
}

interface MeasurementV3 {
  createdAt: number;
  weight: number;
}

interface RecordV3 {
  type: string;
  exercise: string;
  program: string | undefined;
  createdAt: number;
  current: number;
  full: number | undefined;
}

type ExerciseWeightV3 =
  | { type: "full" }
  | { type: "positive" | "negative"; selfWeightPercent: number };

const BODY_WEIGHT_EXERCISES_V3: Record<string, ExerciseWeightV3> = {
  mOgcynAZufVTTLxAiADV: { type: "positive", selfWeightPercent: 25 },
  CH9xHvgvcnk3572Qh82q: { type: "positive", selfWeightPercent: 25 },
  P03Q501AwZPPL5s7sLN5: { type: "positive", selfWeightPercent: 100 },
  Wa6kyQhTiGRur6z8p7xZ: { type: "positive", selfWeightPercent: 100 },
  "7wGjDt7HL8RK8eu0Cfc7": { type: "negative", selfWeightPercent: 100 },
  I4ThGLxJyoXzcFdfFfpO: { type: "positive", selfWeightPercent: 100 },
  aPtSAO6ZEBZ2401nIDLK: { type: "negative", selfWeightPercent: 100 },
  md6HLXAXou4SEwRPjssW: { type: "positive", selfWeightPercent: 100 },
  RRsBEHSyiYyZ6KsCt2LE: { type: "negative", selfWeightPercent: 100 },
  tYCzxni00QUvnavXoGXf: { type: "positive", selfWeightPercent: 25 },
  rwUri6ZQG6QTXGCvghCs: { type: "positive", selfWeightPercent: 25 },
  xxHwgWeeI6V29ktq6jA6: { type: "positive", selfWeightPercent: 25 },
  Txx1kCEjSmank1XX1aCP: { type: "positive", selfWeightPercent: 25 },
  z9zakVGsyY2ep6UjHK7p: { type: "positive", selfWeightPercent: 25 },
  qgjsNpa5H5b9kK8LrJNX: { type: "positive", selfWeightPercent: 25 },
};

function epley(weight: number, reps: number): number {
  return weight * (1 + reps / 30);
}

function fullWeight(
  exerciseWeight: ExerciseWeightV3,
  selfWeight: number | undefined,
  weight: number,
): number {
  if (exerciseWeight.type === "full") return weight;
  const body = ((selfWeight ?? 0) * exerciseWeight.selfWeightPercent) / 100;
  return exerciseWeight.type === "positive" ? body + weight : body - weight;
}

function byValue(
  a: { current: number; full?: number },
  b: { current: number; full?: number },
): number {
  return a.full !== undefined && b.full !== undefined
    ? a.full - b.full
    : a.current - b.current;
}

function latest<E extends { createdAt: number }>(entities: E[]): E | null {
  return maxBy(entities, (a, b) => a.createdAt - b.createdAt);
}

function maxBy<E>(entities: E[], compare: (a: E, b: E) => number): E | null {
  return entities.reduce<E | null>(
    (best, e) => (best === null || compare(e, best) > 0 ? e : best),
    null,
  );
}

function values<E>(doc: Y.Doc, name: string): E[] {
  return [...collection(doc, name).entries()].map(
    ([id, data]) => ({ id, ...data.toJSON() }) as E,
  );
}

export const SCHEMA_VERSION = MIGRATIONS.length;

const VERSION_KEY = "version";

function meta(doc: Y.Doc): Y.Map<unknown> {
  return doc.getMap("meta");
}

export function readSchemaVersion(doc: Y.Doc): number {
  const version = meta(doc).get(VERSION_KEY);
  return typeof version === "number" ? version : 0;
}

export function useSchemaVersion(store: Store): number {
  const [version, setVersion] = useState(() =>
    readSchemaVersion(store.personal),
  );

  useEffect(() => {
    const map = meta(store.personal);
    const observer = () => setVersion(readSchemaVersion(store.personal));
    observer();
    map.observe(observer);
    return () => map.unobserve(observer);
  }, [store]);

  return version;
}

export function migrate(doc: Y.Doc, migrations: Migration[] = MIGRATIONS) {
  const from = readSchemaVersion(doc);
  if (from >= migrations.length) return;

  doc.transact(() => {
    for (let v = from; v < migrations.length; ++v) {
      migrations[v](doc);
    }
    meta(doc).set(VERSION_KEY, migrations.length);
  });
}
