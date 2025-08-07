import type { Performance, WeightUnits } from "../../../../db/performances.ts";
import type { SetType } from "../../../../db/sets.ts";

export interface PerformanceProps {
  performance: Performance;
}

export interface WorkingVolume {
  weight: number;
  reps: number;
  oneRepMax: number;
}

export interface SetData {
  type: SetType;
  weight: number;
  reps: number;
  weights?: WeightsConstructor;
}

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
  additional?: number;
}
