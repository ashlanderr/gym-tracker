import type { WeightUnits } from "../../../db";

export const DEFAULT_PLATES: Record<WeightUnits, number[]> = {
  kg: [1.25, 2.5, 5, 10, 20, 25],
  lbs: [2.5, 5, 10, 25, 35, 45],
};

export const BARBELL_DEFAULT_BASE: Record<WeightUnits, number> = {
  kg: 20,
  lbs: 45,
};

export const BARBELL_BASES: Record<WeightUnits, number[]> = {
  kg: [7.5, 10, 15, BARBELL_DEFAULT_BASE.kg],
  lbs: [15, 25, 35, BARBELL_DEFAULT_BASE.lbs],
};
