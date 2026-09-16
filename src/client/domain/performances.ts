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
  updatePerformance,
} from "../db";
import { addNextSet, duplicateSet } from "./sets.ts";

const DEFAULT_REPS: RepRange = { min: 8, max: 12 };

export function addPerformance(
  store: Store,
  workout: Workout,
  exercise: string,
): Performance {
  return createPerformance(store, workout, exercise, generateId(), null);
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
): Performance {
  const workoutPerformances = queryPerformancesByWorkout(store, workout.id);
  const nextOrder =
    Math.max(-1, ...workoutPerformances.map((s) => s.order)) + 1;

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
    order: nextOrder,
    startedAt: workout.startedAt,
    reps,
    timer: source?.timer,
  });

  const prevSets = prevPerformance
    ? querySetsByPerformance(store, prevPerformance.id)
    : [];

  if (prevSets.length !== 0) {
    for (const oldSet of prevSets) {
      duplicateSet(store, performance, oldSet);
    }
  } else {
    addNextSet(store, performance);
  }

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

  const newPerformance = addPerformance(store, workout, newExercise);

  return updatePerformance(store, {
    ...newPerformance,
    order: oldPerformance.order,
  });
}
