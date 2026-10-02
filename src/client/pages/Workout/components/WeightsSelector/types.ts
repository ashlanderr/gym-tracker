import type { Exercise, Gym } from "../../../../db";

export interface WeightsSelectorProps {
  exercise: Exercise;
  gym: Gym;
  onCancel: () => void;
  onSubmit: (gym: Gym) => void;
}
