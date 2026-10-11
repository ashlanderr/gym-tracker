import type { EquipmentType, PerformanceWeights } from "../../../../db";

export interface WeightsSelectorModalData {
  equipment: EquipmentType;
  weights: PerformanceWeights | undefined;
  previewKg: number | undefined;
}

// Wrapped, because no weights is a choice here and undefined means cancel.
export interface WeightsSelectorModalResult {
  weights: PerformanceWeights | undefined;
}
