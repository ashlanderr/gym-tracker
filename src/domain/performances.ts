import {
  addPerformance as addPerformanceInner,
  generateId,
  type Performance,
  queryPerformancesByWorkout,
  queryPreviousPerformance,
  querySetsByPerformance,
  type Store,
  type Workout,
  deletePerformance as deletePerformanceInner,
  queryRecordsByPerformance,
  deleteRecord,
  deleteSet,
  queryWorkoutById,
  updatePerformance,
} from "../db";
import { addNextSet, duplicateSet } from "./sets.ts";
import { computeNextPeriodization } from "./recommendations";

export function addPerformance(
  store: Store,
  workout: Workout,
  exercise: string,
): Performance {
  const workoutPerformances = queryPerformancesByWorkout(store, workout.id);
  const nextOrder =
    Math.max(-1, ...workoutPerformances.map((s) => s.order)) + 1;

  const prevPerformance = queryPreviousPerformance(store, exercise, Date.now());

  const prevSets =
    prevPerformance && querySetsByPerformance(store, prevPerformance.id);

  const performance = addPerformanceInner(store, {
    id: generateId(),
    user: workout.user,
    workout: workout.id,
    exercise: exercise,
    order: nextOrder,
    startedAt: workout.startedAt,
    weights: prevPerformance?.weights,
    timer: prevPerformance?.timer,
    periodization: computeNextPeriodization(prevPerformance?.periodization),
    program: workout.program,
  });

  if (prevSets) {
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

  updatePerformance(store, {
    ...newPerformance,
    order: oldPerformance.order,
  });

  return newPerformance;
}
