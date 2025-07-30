import type { Exercise } from "../../../../db/exercises.ts";

export interface AddExerciseProps {
  onCancel: () => void;
  onSubmit: (exercise: Exercise) => void;
}
