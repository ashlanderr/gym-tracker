import {
  generateId,
  type Store,
  addWorkout as addWorkoutInner,
  type Workout,
  updateWorkout,
  queryPerformancesByWorkout,
  deletePerformance,
  queryRecordsByWorkout,
  deleteSet,
  querySetsByWorkout,
  deleteRecord,
  deleteWorkout,
  updatePerformance,
} from "../db";
import { addPerformance } from "./performances.ts";
import {
  computeNextPeriodization,
  getCurrentPeriodization,
} from "./recommendations";

export function addWorkout(store: Store, user: string): Workout {
  return addWorkoutInner(store, {
    id: generateId(),
    user,
    name: "Новая тренировка",
    startedAt: Date.now(),
    completedAt: null,
    volume: 0,
    sets: 0,
  });
}

export function duplicateWorkout(store: Store, oldWorkout: Workout): Workout {
  const newWorkout = addWorkout(store, oldWorkout.user);

  updateWorkout(store, {
    ...newWorkout,
    name: oldWorkout.name,
    periodization: oldWorkout.periodization
      ? computeNextPeriodization(oldWorkout.periodization)
      : undefined,
  });

  const performances = queryPerformancesByWorkout(store, oldWorkout.id);

  for (const oldPerformance of performances) {
    addPerformance(store, newWorkout, oldPerformance.exercise);
  }

  return newWorkout;
}

export function completeWorkout(
  store: Store,
  workout: Workout,
  newName: string,
): Workout {
  const performances = queryPerformancesByWorkout(store, workout.id);
  const records = queryRecordsByWorkout(store, workout.id);
  const sets = querySetsByWorkout(store, workout.id);
  const completedSets = sets.filter((s) => s.completed);
  const volume = completedSets.reduce((a, b) => a + b.weight * b.reps, 0);

  const currentPeriodization =
    workout.periodization && getCurrentPeriodization(workout.periodization);

  for (const performance of performances) {
    const performanceSets = sets.filter(
      (s) => s.performance === performance.id,
    );
    let emptyPerformance = true;

    for (const set of performanceSets) {
      if (!set.completed) {
        deleteSet(store, set);
      } else {
        emptyPerformance = false;
      }
    }

    if (emptyPerformance) {
      deletePerformance(store, performance);
      continue;
    }

    updatePerformance(store, {
      ...performance,
      periodization: currentPeriodization,
    });
  }

  workout = updateWorkout(store, {
    ...workout,
    completedAt: workout.completedAt ?? Date.now(),
    name: newName,
    sets: completedSets.length,
    records: records.length !== 0 ? records.length : undefined,
    volume,
  });

  return workout;
}

export function cancelWorkout(store: Store, workout: Workout) {
  const performances = queryPerformancesByWorkout(store, workout.id);
  const sets = querySetsByWorkout(store, workout.id);
  const records = queryRecordsByWorkout(store, workout.id);

  records.map((r) => deleteRecord(store, r));
  sets.forEach((s) => deleteSet(store, s));
  performances.forEach((p) => deletePerformance(store, p));
  deleteWorkout(store, workout);
}
