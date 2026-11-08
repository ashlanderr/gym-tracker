import type { DumbbellWeights, WeightUnits } from "../../../db";

export const DEFAULT_DUMBBELLS: Record<WeightUnits, DumbbellWeights> = {
  kg: {
    units: "kg",
    count: 2,
    ranges: [{ from: 10, to: 40, step: 2 }],
    excluded: [],
  },
  lbs: {
    units: "lbs",
    count: 2,
    ranges: [{ from: 5, to: 100, step: 5 }],
    excluded: [],
  },
};

export const DEFAULT_PLATES: Record<WeightUnits, number[]> = {
  kg: [1.25, 2.5, 5, 10, 20, 25],
  lbs: [2.5, 5, 10, 25, 35, 45],
};

export const REPS_PICKER_MAX = 30;

export const BARBELL_DEFAULT_BASE: Record<WeightUnits, number> = {
  kg: 20,
  lbs: 45,
};

export const BARBELL_BASES: Record<WeightUnits, number[]> = {
  kg: [7.5, 10, 15, BARBELL_DEFAULT_BASE.kg],
  lbs: [15, 25, 35, BARBELL_DEFAULT_BASE.lbs],
};
