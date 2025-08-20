import type { Exercise } from "../../../../db";

export interface ChooseExerciseProps {
  onCancel: () => void;
  onSubmit: (exercise: Exercise) => void;
}
