import type { ExerciseRepRange, ExerciseWeight } from "../../../db";
import type { RoundingMode } from "../../weights";

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

export const MIN_REPS: Record<ExerciseRepRange, number> = {
  low: 6,
  medium: 8,
  high: 12,
};

export const WEIGHT_ROUNDING: Record<ExerciseWeight["type"], RoundingMode> = {
  full: "floor",
  positive: "floor",
  negative: "ceil",
};

export const DEFAULT_WEIGHT_DROP = 0.95;
