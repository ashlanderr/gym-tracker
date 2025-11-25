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
} from "../db";
import { addSelfWeight, volumeToOneRepMax } from "./weights";

interface RecordData {
  set: CompletedSet;
  current: number;
  full: number;
  createdAt: number;
}

export function updateRecords(store: Store, set: Set) {
  const workout = queryWorkoutById(store, set.workout);
  if (!workout) return;

  const performance = queryPerformanceById(store, set.performance);
  if (!performance) return;

  const exercise = queryExerciseById(store, set.exercise);
  if (!exercise) return;

  const measurement = queryLatestMeasurement(store, performance.startedAt);
  const selfWeight = measurement?.weight;

  updateRecord(
    store,
    performance,
    "one_rep_max",
    (s) => volumeToOneRepMax(s.weight, s.reps),
    (s) =>
      volumeToOneRepMax(
        addSelfWeight(exercise.weight, selfWeight, s.weight),
        s.reps,
      ),
    addIfGreater,
  );

  updateRecord(
    store,
    performance,
    "training_max",
    (s) => volumeToOneRepMax(s.weight, s.reps),
    (s) =>
      volumeToOneRepMax(
        addSelfWeight(exercise.weight, selfWeight, s.weight),
        s.reps,
      ),
    addOnHeavyPerformance(performance),
  );

  updateRecord(
    store,
    performance,
    "weight",
    (s) => s.weight,
    (s) => addSelfWeight(exercise.weight, selfWeight, s.weight),
    addIfGreater,
  );

  updateRecord(
    store,
    performance,
    "volume",
    (s) => s.weight * s.reps,
    (s) => addSelfWeight(exercise.weight, selfWeight, s.weight) * s.reps,
    addIfGreater,
  );
}

function updateRecord(
  store: Store,
  performance: Performance,
  type: RecordType,
  currentSelector: (set: CompletedSet) => number,
  fullSelector: (set: CompletedSet) => number,
  shouldAdd: (previous: RecordNumbers, current: RecordNumbers) => boolean,
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
    performance.startedAt,
  );

  if (previousRecord && !shouldAdd(previousRecord, maxValue)) return;

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
  });
}

function addIfGreater(
  previous: RecordNumbers,
  current: RecordNumbers,
): boolean {
  return compareRecordsByValue(current, previous) > 0;
}

function addOnHeavyPerformance(performance: Performance) {
  const isHeavy = performance?.periodization === "heavy";
  return () => isHeavy;
}
