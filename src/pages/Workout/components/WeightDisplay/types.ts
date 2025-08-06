import type { WeightsConstructor } from "../Performance/types.ts";
import type { EquipmentType } from "../../../../db/exercises.ts";

export interface WeightDisplayProps {
  equipment: EquipmentType;
  data: WeightsConstructor;
}
