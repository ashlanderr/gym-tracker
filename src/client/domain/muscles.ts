import type { Exercise, MuscleType } from "../db";

export type MuscleLevel = 1 | 2 | 3;

export interface MuscleWork {
  exercise: Exercise;
  sets: number;
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
