import {
  addPerformance as addPerformanceInner,
  generateId,
  type Performance,
  queryPerformancesByWorkout,
  queryPreviousPerformance,
  queryExerciseById,
  querySetsByPerformance,
  type Store,
  type Workout,
  type RepRange,
  deletePerformance as deletePerformanceInner,
  queryRecordsByPerformance,
  deleteRecord,
  deleteSet,
  queryWorkoutById,
} from "../db";
import { addNextSet, duplicateSet, insertWarmUps } from "./sets.ts";

const DEFAULT_REPS: RepRange = { min: 8, max: 12 };

// Enough sets for weight finding to show itself on a new exercise. The real
// number comes with the programs.
const NEW_EXERCISE_SETS = 3;

export function addPerformance(
  store: Store,
  workout: Workout,
  exercise: string,
): Performance {
  return createPerformance(store, workout, exercise, generateId(), null);
}

function nextPerformanceOrder(store: Store, workout: string): number {
  const performances = queryPerformancesByWorkout(store, workout);
  return Math.max(-1, ...performances.map((p) => p.order)) + 1;
}

// Copies a performance into another workout keeping its slot, so the slot
// history continues. Sets are copied from the latest performance of the slot.
export function continuePerformance(
  store: Store,
  workout: Workout,
  oldPerformance: Performance,
): Performance {
  return createPerformance(
    store,
    workout,
    oldPerformance.exercise,
    oldPerformance.slot,
    oldPerformance,
  );
}

function createPerformance(
  store: Store,
  workout: Workout,
  exercise: string,
  slot: string,
  template: Performance | null,
  order: number = nextPerformanceOrder(store, workout.id),
): Performance {
  const prevPerformance = queryPreviousPerformance(
    store,
    slot,
    exercise,
    workout.startedAt,
  );

  const source = template ?? prevPerformance;
  const reps =
    source?.reps ?? queryExerciseById(store, exercise)?.reps ?? DEFAULT_REPS;

  const performance = addPerformanceInner(store, {
    id: generateId(),
    user: workout.user,
    workout: workout.id,
    exercise,
    slot,
    order,
    startedAt: workout.startedAt,
    reps,
    timer: source?.timer,
  });

  // Warm-ups are never copied: whether they are needed is decided anew,
  // since it depends on the weight and on the exercises before this one.
  const prevSets = prevPerformance
    ? querySetsByPerformance(store, prevPerformance.id).filter(
        (s) => s.type !== "warm-up",
      )
    : [];

  if (prevSets.length !== 0) {
    for (const oldSet of prevSets) {
      duplicateSet(store, performance, oldSet);
    }
  } else {
    for (let i = 0; i < NEW_EXERCISE_SETS; ++i) addNextSet(store, performance);
  }

  insertWarmUps(store, performance);

  return performance;
}

export function deletePerformance(store: Store, performance: Performance) {
  const sets = querySetsByPerformance(store, performance.id);
  const records = queryRecordsByPerformance(store, performance.id);

  records.forEach((record) => deleteRecord(store, record));
  sets.forEach((set) => deleteSet(store, set));
  deletePerformanceInner(store, performance);
}

export function replacePerformance(
  store: Store,
  oldPerformance: Performance,
  newExercise: string,
): Performance {
  const workout = queryWorkoutById(store, oldPerformance.workout);
  if (!workout) return oldPerformance;

  deletePerformance(store, oldPerformance);

  return createPerformance(
    store,
    workout,
    newExercise,
    generateId(),
    null,
    oldPerformance.order,
  );
}
