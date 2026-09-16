import type { WeightUnits } from "../../db";

export type RoundingMode = "floor" | "ceil" | "round";

// Plates are listed for one side, heaviest first.
export type WeightsConstructor =
  | {
      type: "barbell";
      units: WeightUnits;
      totalKg: number;
      bar: number;
      plates: number[];
    }
  | {
      type: "plates";
      units: WeightUnits;
      totalKg: number;
      sides: 1 | 2;
      plates: number[];
    }
  | {
      type: "dumbbell";
      units: WeightUnits;
      totalKg: number;
      dumbbell: number;
      count: 1 | 2;
    }
  | {
      type: "stack";
      units: WeightUnits;
      totalKg: number;
      stack: number;
      additional: number;
    };
