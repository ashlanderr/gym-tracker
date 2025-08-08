import type { PerformanceWeights } from "../../../../db/performances.ts";
import type { EquipmentType } from "../../../../db/exercises.ts";

export interface WeightsSelectorProps {
  equipment: EquipmentType;
  value: PerformanceWeights | undefined;
  onChange: (value: PerformanceWeights | undefined) => void;
}
