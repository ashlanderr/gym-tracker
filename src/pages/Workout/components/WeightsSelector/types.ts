import type { PerformanceWeights, EquipmentType } from "../../../../db";

export interface WeightsSelectorProps {
  equipment: EquipmentType;
  value: PerformanceWeights | undefined;
  onChange: (value: PerformanceWeights | undefined) => void;
}
