import {
  addRecord,
  compareRecordsByValue,
  type CompletedSet,
  generateId,
  queryExerciseById,
  queryLatestMeasurement,
  queryPerformanceById,
  queryPreviousRecordByExercise,
  querySetsByPerformance,
  type Set,
  type Store,
  type Performance,
  type RecordType,
  queryRecordsByPerformance,
  deleteRecord,
  maxBy,
  type RecordNumbers,
  queryWorkoutById,
  queryRecordsByType,
  queryAllPerformances,
} from "../db";
import { addSelfWeight, volumeToOneRepMax } from "./weights";

interface RecordData {
  set: CompletedSet;
  current: number;
  full: number;
  createdAt: number;
}

export const MEDAL_RECORDS: RecordType[] = ["one_rep_max", "weight", "volume"];

export function updateRecords(store: Store, set: Set) {
  const performance = queryPerformanceById(store, set.performance);
  if (performance) updatePerformanceRecords(store, performance, MEDAL_RECORDS);
}

// Records of 1RM depend on the formula, so a new one builds them again from
// the sets, the oldest performance first, the same way as they were done.
export function rebuildOneRepMaxRecords(store: Store) {
  queryRecordsByType(store, "one_rep_max").forEach((r) =>
    deleteRecord(store, r),
  );

  queryAllPerformances(store)
    .sort((a, b) => a.startedAt - b.startedAt)
    .forEach((p) => updatePerformanceRecords(store, p, ["one_rep_max"]));
}

function updatePerformanceRecords(
  store: Store,
  performance: Performance,
  types: RecordType[],
) {
  if (!queryWorkoutById(store, performance.workout)) return;

  const exercise = queryExerciseById(store, performance.exercise);
  if (!exercise) return;

  const measurement = queryLatestMeasurement(store, performance.startedAt);
  const selfWeight = measurement?.weight;
  const full = (s: CompletedSet) =>
    addSelfWeight(exercise.weight, selfWeight, s.weight);

  const selectors: { [T in RecordType]: [Selector, Selector] } = {
    one_rep_max: [
      (s) => volumeToOneRepMax(s.weight, s.reps),
      (s) => volumeToOneRepMax(full(s), s.reps),
    ],
    weight: [(s) => s.weight, full],
    volume: [(s) => s.weight * s.reps, (s) => full(s) * s.reps],
  };

  for (const type of types) {
    updateRecord(store, performance, type, ...selectors[type]);
  }
}

type Selector = (set: CompletedSet) => number;

function updateRecord(
  store: Store,
  performance: Performance,
  type: RecordType,
  currentSelector: Selector,
  fullSelector: Selector,
) {
  queryRecordsByPerformance(store, performance.id) //
    .filter((r) => r.type === type)
    .forEach((r) => deleteRecord(store, r));

  const sets = querySetsByPerformance(store, performance.id);

  const values: Array<RecordData> = sets
    .filter((s) => s.completed)
    .filter((s) => s.type !== "warm-up")
    .map((s) => ({
      set: s,
      current: currentSelector(s),
      full: fullSelector(s),
      createdAt: performance.startedAt,
    }));

  const maxValue = maxBy(values, compareRecordsByValue);
  if (!maxValue) return;

  const previousRecord = queryPreviousRecordByExercise(
    store,
    type,
    performance.exercise,
    performance.program,
    performance.startedAt,
  );

  if (previousRecord && !addIfGreater(previousRecord, maxValue)) return;

  addRecord(store, {
    id: generateId(),
    user: performance.user,
    workout: performance.workout,
    exercise: performance.exercise,
    performance: performance.id,
    set: maxValue.set.id,
    createdAt: performance.startedAt,
    type: type,
    previous: previousRecord?.current,
    current: maxValue.current,
    full: maxValue.full,
    program: performance.program,
  });
}

function addIfGreater(
  previous: RecordNumbers,
  current: RecordNumbers,
): boolean {
  return compareRecordsByValue(current, previous) > 0;
}
