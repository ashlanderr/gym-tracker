import type { EquipmentType, PerformanceWeights } from "../../../../db";

export interface WeightsSelectorModalData {
  equipment: EquipmentType;
  weights: PerformanceWeights | undefined;
  previewKg: number | undefined;
}
