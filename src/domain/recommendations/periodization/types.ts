import type { RoundingMode } from "../../weights";

export interface ModeParams {
  minReps: number;
  maxReps: number;
}

export interface WeightUpdateParams {
  rounding: RoundingMode;
  direction: number;
}
