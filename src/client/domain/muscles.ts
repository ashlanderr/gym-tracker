import {
  type Exercise,
  type MuscleType,
  queryExerciseById,
  queryPerformancesSince,
  querySetsByPerformance,
  type Store,
} from "../db";

export type MuscleLevel = 1 | 2 | 3;

export interface MuscleWork {
  exercise: Exercise;
  sets: number;
}

export interface RecentMuscleWork {
  work: MuscleWork[];
  // Workouts with at least one working set done.
  workouts: number;
}

export const MUSCLE_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

// Counted on the fly: a month is about a hundred performances, and the only
// slow part is the collection scan every query already does.
export function queryRecentMuscleWork(
  store: Store,
  now: number,
): RecentMuscleWork {
  const workouts = new Set<string>();
  const work = queryPerformancesSince(store, now - MUSCLE_WINDOW_MS).flatMap(
    (performance) => {
      const exercise = queryExerciseById(store, performance.exercise);
      const sets = querySetsByPerformance(store, performance.id).filter(
        (s) => s.completed && s.type !== "warm-up",
      ).length;
      if (!exercise || sets === 0) return [];
      workouts.add(performance.workout);
      return [{ exercise, sets }];
    },
  );
  return { work, workouts: workouts.size };
}

const PRIMARY_SHARE = 1;
const SECONDARY_SHARE = 0.5;
const LEVELS = 3;

// How much each muscle worked relative to the busiest one: every set counts
// fully for primary muscles and half for secondary ones.
export function computeMuscleLevels(
  work: MuscleWork[],
): Partial<Record<MuscleType, MuscleLevel>> {
  const load = new Map<MuscleType, number>();
  const add = (muscle: MuscleType, value: number) =>
    load.set(muscle, (load.get(muscle) ?? 0) + value);

  for (const { exercise, sets } of work) {
    exercise.primaryMuscles.forEach((m) => add(m, sets * PRIMARY_SHARE));
    exercise.secondaryMuscles.forEach((m) => add(m, sets * SECONDARY_SHARE));
  }

  const max = Math.max(0, ...load.values());
  const levels: Partial<Record<MuscleType, MuscleLevel>> = {};

  for (const [muscle, value] of load) {
    if (value > 0) {
      levels[muscle] = Math.ceil((value / max) * LEVELS) as MuscleLevel;
    }
  }

  return levels;
}
