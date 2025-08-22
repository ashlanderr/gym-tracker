import {
  generateId,
  type Store,
  addWorkout as addWorkoutInner,
  type Workout,
  updateWorkout,
  queryPerformancesByWorkout,
  queryPeriodizationByUser,
  deletePerformance,
  queryRecordsByWorkout,
  deleteSet,
  querySetsByWorkout,
  type Performance as PerformanceEntity,
  queryLatestMeasurement,
  queryExerciseById,
  querySetsByPerformance,
  queryPreviousPerformance,
  updatePerformance,
  updatePeriodization,
  deleteRecord,
  deleteWorkout,
} from "../db";
import { addPerformance } from "./performances.ts";
import {
  computeNextPeriodization,
  computeNextProgression,
} from "./recommendations";

export function addWorkout(store: Store, user: string): Workout {
  const periodization = queryPeriodizationByUser(store, user);

  return addWorkoutInner(store, {
    id: generateId(),
    user,
    name: "Новая тренировка",
    startedAt: Date.now(),
    completedAt: null,
    volume: 0,
    sets: 0,
    periodization: periodization
      ? {
          counter: periodization.counter,
          light: periodization.light,
          medium: periodization.medium,
          heavy: periodization.heavy,
        }
      : undefined,
  });
}

export function duplicateWorkout(store: Store, oldWorkout: Workout): Workout {
  const newWorkout = addWorkout(store, oldWorkout.user);

  updateWorkout(store, {
    ...newWorkout,
    name: oldWorkout.name,
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
  const periodization = queryPeriodizationByUser(store, workout.user);
  const performances = queryPerformancesByWorkout(store, workout.id);
  const records = queryRecordsByWorkout(store, workout.id);
  const sets = querySetsByWorkout(store, workout.id);
  const completedSets = sets.filter((s) => s.completed);
  const volume = completedSets.reduce((a, b) => a + b.weight * b.reps, 0);

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

    updateProgression(store, performance);
  }

  if (periodization && workout.completedAt === null) {
    updatePeriodization(store, {
      ...periodization,
      ...computeNextPeriodization(periodization),
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

function updateProgression(store: Store, performance: PerformanceEntity) {
  const measurement = queryLatestMeasurement(store, performance.startedAt);
  const exercise = queryExerciseById(store, performance.exercise);

  const currentSets = querySetsByPerformance(store, performance.id).filter(
    (s) => s.completed,
  );

  const prevPerformance = queryPreviousPerformance(
    store,
    performance.exercise,
    performance.startedAt,
  );

  const prevSets = querySetsByPerformance(
    store,
    prevPerformance?.id ?? "",
  ).filter((s) => s.completed);

  const progression = computeNextProgression({
    performanceWeights: performance.weights,
    selfWeight: measurement?.weight,
    exerciseWeights: exercise?.weight,
    progression: prevPerformance?.progression,
    prevSets,
    currentSets,
  });

  updatePerformance(store, {
    ...performance,
    progression,
  });
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
