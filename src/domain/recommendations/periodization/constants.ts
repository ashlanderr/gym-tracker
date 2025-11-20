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
      reserve: 4,
    },
    medium: {
      minReps: 7,
      maxReps: 9,
      reserve: 2,
    },
    heavy: {
      minReps: 4,
      maxReps: 6,
      reserve: -1,
    },
  },
  medium: {
    light: {
      minReps: 12,
      maxReps: 15,
      reserve: 4,
    },
    medium: {
      minReps: 10,
      maxReps: 12,
      reserve: 2,
    },
    heavy: {
      minReps: 6,
      maxReps: 8,
      reserve: -1,
    },
  },
  high: {
    light: {
      minReps: 15,
      maxReps: 20,
      reserve: 4,
    },
    medium: {
      minReps: 12,
      maxReps: 15,
      reserve: 2,
    },
    heavy: {
      minReps: 10,
      maxReps: 12,
      reserve: -1,
    },
  },
};
