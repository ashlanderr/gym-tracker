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
  type Program,
  querySetsByPerformance,
  queryWorkoutsByRepeat,
  maxBy,
  type WorkoutRepeat,
} from "../db";
import { addPerformance } from "./performances.ts";
import { MEDAL_RECORDS, updateRecords } from "./records.ts";

const DAY = 24 * 60 * 60 * 1000;

export function addWorkout(store: Store, user: string, daysAgo = 0): Workout {
  return addWorkoutInner(store, {
    id: generateId(),
    user,
    name: "Новая тренировка",
    startedAt: Date.now() - daysAgo * DAY,
    completedAt: null,
    volume: 0,
    sets: 0,
  });
}

// A workout written down on a past day starts whole days ago at this hour,
// so the time spent on it is what is left over those days.
export function workoutNow(startedAt: number, now = Date.now()): number {
  return startedAt + ((now - startedAt) % DAY);
}

export function duplicateWorkout(store: Store, oldWorkout: Workout): Workout {
  let newWorkout = addWorkout(store, oldWorkout.user);

  newWorkout = updateWorkout(store, {
    ...newWorkout,
    name: oldWorkout.name,
    program: oldWorkout.program,
    repeat: oldWorkout.repeat,
  });

  const oldPerformances = queryPerformancesByWorkout(store, oldWorkout.id);

  for (const oldPerformance of oldPerformances) {
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
  const records = queryRecordsByWorkout(store, workout.id).filter((r) =>
    MEDAL_RECORDS.includes(r.type),
  );
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
    }
  }

  workout = updateWorkout(store, {
    ...workout,
    completedAt: workout.completedAt ?? workoutNow(workout.startedAt),
    name: newName,
    sets: completedSets.length,
    records: records.length !== 0 ? records.length : undefined,
    volume,
  });

  return workout;
}

export function setWorkoutProgram(
  store: Store,
  workout: Workout,
  program: Program | undefined,
): Workout {
  const performances = queryPerformancesByWorkout(store, workout.id);

  for (const performance of performances) {
    updatePerformance(store, {
      ...performance,
      program: program?.id,
    });

    const [set] = querySetsByPerformance(store, performance.id);
    if (set) updateRecords(store, set);
  }

  return updateWorkout(store, {
    ...workout,
    program: program?.id,
  });
}

// The rule lives on the latest repeat, so that is the one to change. Stopping
// takes the rule off every repeat: an older one must not take over.
export function setWorkoutRepeat(
  store: Store,
  workout: Workout,
  rule: Omit<WorkoutRepeat, "id"> | null,
) {
  const id = workout.repeat?.id ?? generateId();
  const repeats = queryWorkoutsByRepeat(store, id);
  const latest = maxBy(repeats, (a, b) => a.startedAt - b.startedAt) ?? workout;

  if (rule) {
    updateWorkout(store, { ...latest, repeat: { id, ...rule } });
    return;
  }

  for (const repeat of repeats) {
    updateWorkout(store, { ...repeat, repeat: undefined });
  }
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
