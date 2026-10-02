import type { WeightList, WeightUnits } from "../../../db";

export const DEFAULT_PLATES: Record<WeightUnits, number[]> = {
  kg: [0.5, 1.25, 2.5, 5, 10, 15, 20, 25],
  lb: [2.5, 5, 10, 25, 35, 45],
};

export const BARBELL_BASES: Record<WeightUnits, number[]> = {
  kg: [5, 7.5, 10, 15, 20],
  lb: [15, 25, 35, 45],
};

// What a typical gym has, to start the inventory page from. Dumbbells and
// stacks differ too much between gyms to guess.
export const TYPICAL_BARS: Record<WeightUnits, WeightList> = {
  kg: { units: "kg", items: [20] },
  lb: { units: "lb", items: [45] },
};

export const TYPICAL_PLATES: Record<WeightUnits, WeightList> = {
  kg: { units: "kg", items: [25, 20, 15, 10, 5, 2.5, 1.25] },
  lb: { units: "lb", items: [45, 35, 25, 10, 5, 2.5] },
};

export const DUMBBELL_MIN: Record<WeightUnits, number[]> = {
  kg: [1, 2, 2.5, 4, 5],
  lb: [2, 3, 5, 10],
};

export const DUMBBELL_MAX: Record<WeightUnits, number[]> = {
  kg: [10, 20, 30, 40, 50, 60],
  lb: [25, 50, 75, 100, 120, 150],
};

export const DUMBBELL_STEPS: Record<WeightUnits, number[]> = {
  kg: [1, 2, 2.5, 5],
  lb: [2.5, 5, 10],
};

export const STACK_BASES: Record<WeightUnits, number[]> = {
  kg: [0, 2.5, 5, 7.5, 10, 15, 20],
  lb: [0, 5, 10, 15, 20],
};

export const STACK_STEPS: Record<WeightUnits, number[]> = {
  kg: [2.5, 5, 10, 15, 20],
  lb: [5, 10, 15, 20],
};

export const STACK_MAX: Record<WeightUnits, number[]> = {
  kg: [50, 60, 70, 80, 90, 100, 120, 150, 200],
  lb: [100, 150, 200, 250, 300],
};

export const STACK_ADDITIONAL: Record<WeightUnits, number[]> = {
  kg: [1.25, 2.5, 5],
  lb: [2.5, 5],
};
