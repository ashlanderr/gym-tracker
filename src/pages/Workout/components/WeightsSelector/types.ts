import type { Weights } from "../../../../db/performances.ts";
import type { EquipmentType } from "../../../../db/exercises.ts";

export interface WeightsSelectorProps {
  equipment: EquipmentType;
  value: Weights | undefined;
  onChange: (value: Weights | undefined) => void;
}
