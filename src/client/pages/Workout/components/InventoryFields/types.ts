import type {
  DumbbellSet,
  Exercise,
  StackWeights,
  WeightList,
  WeightUnits,
} from "../../../../db";

type Draft<T> = { [K in keyof T]?: T[K] } & { units: WeightUnits };

// What the person is choosing on the page, before it is complete enough to
// become part of the gym.
export interface InventoryDraft {
  plates: WeightList;
  bars: WeightList;
  dumbbells: Draft<DumbbellSet>;
  stack: Draft<StackWeights>;
}

export interface InventoryFieldsProps {
  exercise: Exercise;
  draft: InventoryDraft;
  onChange: (draft: InventoryDraft) => void;
}

export interface ChipRow<T extends string | number> {
  label: string;
  hint?: string;
  options: T[];
  render: (value: T) => string;
  isSelected: (value: T) => boolean;
  toggle: (value: T) => void;
}
