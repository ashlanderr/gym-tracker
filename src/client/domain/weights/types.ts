import type { WeightUnits } from "../../db";

export interface WeightsConstructor {
  units: WeightUnits;
  totalKg: number;
  totalUnits: number;
  count: number;
  base?: number;
  steps?: Array<{
    weight: number;
    count: number;
  }>;
}

export type RoundingMode = "floor" | "ceil" | "round";
