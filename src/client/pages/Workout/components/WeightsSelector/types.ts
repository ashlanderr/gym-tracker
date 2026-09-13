import type { PerformanceWeights, EquipmentType } from "../../../../db";

export interface WeightsSelectorProps {
  equipment: EquipmentType;
  weights: PerformanceWeights | undefined;
  onCancel: () => void;
  onSubmit: (value: PerformanceWeights | undefined) => void;
}

export interface Selector<T extends string | number> {
  label: string;
  hint?: string;
  options: T[];
  render: (value: T) => string;
  isSelected: (value: T) => boolean;
  toggle: (value: T) => void;
}
