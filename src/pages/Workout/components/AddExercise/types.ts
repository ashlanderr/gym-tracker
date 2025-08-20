import type { Exercise } from "../../../../db";

export interface AddExerciseProps {
  exercise: Exercise | null;
  onCancel: () => void;
  onSubmit: (exercise: Exercise) => void;
}
