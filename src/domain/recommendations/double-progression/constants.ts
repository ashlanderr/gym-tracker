import type { ExerciseRepRange, ExerciseWeight } from "../../../db";
import type { RepRange } from "../types.ts";
import type { WeightUpdateParams } from "./types.ts";

export const REP_RANGES: Record<ExerciseRepRange, RepRange> = {
  low: {
    min: 6,
    max: 8,
  },
  medium: {
    min: 10,
    max: 12,
  },
  high: {
    min: 15,
    max: 20,
  },
};

export const EPSILON_WEIGHT = 0.1;

export const NEXT_WEIGHT_PARAMS: Record<
  ExerciseWeight["type"],
  WeightUpdateParams
> = {
  full: { direction: 1, rounding: "ceil" },
  positive: { direction: 1, rounding: "ceil" },
  negative: { direction: -1, rounding: "floor" },
};

export const PREV_WEIGHT_PARAMS: Record<
  ExerciseWeight["type"],
  WeightUpdateParams
> = {
  full: { direction: -1, rounding: "floor" },
  positive: { direction: -1, rounding: "floor" },
  negative: { direction: 1, rounding: "ceil" },
};
