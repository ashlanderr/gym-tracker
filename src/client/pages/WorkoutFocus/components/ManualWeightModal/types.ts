import type { WeightUnits } from "../../../../db";

export interface ManualWeightData {
  units: WeightUnits;
  weightKg: number | undefined;
}
