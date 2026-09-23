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
  queryWorkoutById,
} from "../db";
import { addSelfWeight, volumeToOneRepMax } from "./weights";

interface RecordData {
  set: CompletedSet;
  current: number;
  createdAt: number;
}

export const MEDAL_RECORDS: RecordType[] = ["one_rep_max", "weight", "volume"];

export function updateRecords(store: Store, set: Set) {
  const workout = queryWorkoutById(store, set.workout);
  if (!workout) return;

  const performance = queryPerformanceById(store, set.performance);
  if (!performance) return;

  const exercise = queryExerciseById(store, set.exercise);
  if (!exercise) return;

  const selfWeight = queryLatestMeasurement(
    store,
    "weight",
    performance.startedAt,
  )?.value;

  const fullWeight = (set: CompletedSet) =>
    addSelfWeight(exercise.weight, selfWeight, set.weight);

  updateRecord(store, performance, "one_rep_max", (s) =>
    volumeToOneRepMax(fullWeight(s), s.reps),
  );
  updateRecord(store, performance, "weight", fullWeight);
  updateRecord(store, performance, "volume", (s) => fullWeight(s) * s.reps);
}

function updateRecord(
  store: Store,
  performance: Performance,
  type: RecordType,
  selector: (set: CompletedSet) => number,
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
      current: selector(s),
      createdAt: performance.startedAt,
    }));

  const maxValue = maxBy(values, compareRecordsByValue);
  if (!maxValue) return;

  const previousRecord = queryPreviousRecordByExercise(
    store,
    type,
    performance.exercise,
    performance.startedAt,
  );

  if (previousRecord && compareRecordsByValue(maxValue, previousRecord) <= 0) {
    return;
  }

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
  });
}
