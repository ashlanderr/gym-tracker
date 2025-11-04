import type { ExerciseRepRange, PeriodizationMode } from "../../../db";
import type { ModeParams } from "./types.ts";

export const WARM_UP_SETS = [
  [
    //
    { weight: 0.6, reps: 12 },
  ],
  [
    //
    { weight: 0.5, reps: 12 },
    { weight: 0.75, reps: 6 },
  ],
  [
    //
    { weight: 0.4, reps: 15 },
    { weight: 0.6, reps: 8 },
    { weight: 0.8, reps: 4 },
  ],
  [
    //
    { weight: 0.3, reps: 15 },
    { weight: 0.5, reps: 10 },
    { weight: 0.7, reps: 6 },
    { weight: 0.85, reps: 2 },
  ],
];

export const MODE_PARAMS: Record<
  ExerciseRepRange,
  Record<PeriodizationMode, ModeParams>
> = {
  low: {
    light: {
      minReps: 10,
      maxReps: 12,
      defaultPercent: 0.652,
      maxPercent: 0.659,
    },
    medium: {
      minReps: 6,
      maxReps: 8,
      defaultPercent: 0.75,
      maxPercent: 0.759,
    },
    heavy: {
      minReps: 4,
      maxReps: 6,
      defaultPercent: 0.857,
      maxPercent: 0.895,
    },
  },
  medium: {
    light: {
      minReps: 12,
      maxReps: 15,
      defaultPercent: 0.612,
      maxPercent: 0.618,
    },
    medium: {
      minReps: 10,
      maxReps: 12,
      defaultPercent: 0.682,
      maxPercent: 0.689,
    },
    heavy: {
      minReps: 6,
      maxReps: 8,
      defaultPercent: 0.811,
      maxPercent: 0.833,
    },
  },
  high: {
    light: {
      minReps: 15,
      maxReps: 20,
      defaultPercent: 0.556,
      maxPercent: 0.582,
    },
    medium: {
      minReps: 12,
      maxReps: 15,
      defaultPercent: 0.638,
      maxPercent: 0.659,
    },
    heavy: {
      minReps: 10,
      maxReps: 12,
      defaultPercent: 0.732,
      maxPercent: 0.77,
    },
  },
};
