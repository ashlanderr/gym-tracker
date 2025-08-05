import type { Exercise } from "../../../../db/exercises.ts";

export interface AddExerciseProps {
  exercise: Exercise | null;
  onCancel: () => void;
  onSubmit: (exercise: Exercise) => void;
}
