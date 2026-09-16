import type { WeightUnits } from "../../../db";

export const DEFAULT_PLATES: Record<WeightUnits, number[]> = {
  kg: [0.5, 1.25, 2.5, 5, 10, 15, 20, 25],
  lbs: [2.5, 5, 10, 25, 35, 45],
};

export const BARBELL_BASES: Record<WeightUnits, number[]> = {
  kg: [5, 7.5, 10, 15, 20],
  lbs: [15, 25, 35, 45],
};

export const DUMBBELL_MIN = [1, 2, 2.5, 4, 5];

export const DUMBBELL_MAX = [10, 20, 30, 40, 50, 60];

export const DUMBBELL_STEPS = [1, 2, 2.5, 5];

export const STACK_BASES = [0, 2.5, 5, 7.5, 10, 15, 20];

export const STACK_STEPS = [2.5, 5, 10, 15, 20];

export const STACK_ADDITIONAL = [1.25, 2.5, 5];
