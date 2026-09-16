import type { Exercise, Gym } from "../../../../db";

export interface WeightsSelectorProps {
  exercise: Exercise;
  gym: Gym;
  onCancel: () => void;
  onSubmit: (gym: Gym) => void;
}

export interface Selector<T extends string | number> {
  label: string;
  hint?: string;
  options: T[];
  render: (value: T) => string;
  isSelected: (value: T) => boolean;
  toggle: (value: T) => void;
}
