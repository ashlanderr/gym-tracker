import {
  addRecord,
  compareRecords,
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
} from "../db";
import { addSelfWeight, volumeToOneRepMax } from "./weights";

interface RecordData {
  set: CompletedSet;
  current: number;
  full: number;
}

export function updateRecords(store: Store, set: Set) {
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
  );

  updateRecord(
    store,
    performance,
    "weight",
    (s) => s.weight,
    (s) => addSelfWeight(exercise.weight, selfWeight, s.weight),
  );

  updateRecord(
    store,
    performance,
    "volume",
    (s) => s.weight * s.reps,
    (s) => addSelfWeight(exercise.weight, selfWeight, s.weight) * s.reps,
  );
}

function updateRecord(
  store: Store,
  performance: Performance,
  type: RecordType,
  currentSelector: (set: CompletedSet) => number,
  fullSelector: (set: CompletedSet) => number,
) {
  queryRecordsByPerformance(store, performance.id) //
    .filter((r) => r.type === type)
    .forEach((r) => deleteRecord(store, r));

  const sets = querySetsByPerformance(store, performance.id).reverse();

  const values: Array<RecordData | undefined> = sets.map((s) =>
    s.completed
      ? {
          set: s,
          current: currentSelector(s),
          full: fullSelector(s),
        }
      : undefined,
  );

  const majorityValue = getMajorityValue(values, compareRecords);
  if (!majorityValue) return;

  const previousRecord = queryPreviousRecordByExercise(
    store,
    type,
    performance.exercise,
    performance.startedAt,
  );

  if (previousRecord && compareRecords(majorityValue, previousRecord) <= 0)
    return;

  addRecord(store, {
    id: generateId(),
    user: performance.user,
    workout: performance.workout,
    exercise: performance.exercise,
    performance: performance.id,
    set: majorityValue.set.id,
    createdAt: performance.startedAt,
    type: type,
    previous: previousRecord?.current,
    current: majorityValue.current,
    full: majorityValue.full,
  });
}

export function getMajorityValue<T>(
  values: Array<T | undefined>,
  compare: (a: T, b: T) => number,
): T | undefined {
  const sortedValues: T[] = values
    .filter((v) => v !== undefined)
    .sort((a, b) => compare(b, a));

  const majority = Math.ceil(values.length / 2);
  let majorityValue: T | undefined = undefined;

  for (const value of sortedValues) {
    const count = sortedValues.filter((v) => compare(v, value) >= 0).length;
    if (count >= majority) {
      majorityValue = value;
      break;
    }
  }

  return majorityValue;
}
