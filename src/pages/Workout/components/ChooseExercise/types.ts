import type { Exercise } from "../../../../db/exercises.ts";

export interface ChooseExerciseProps {
  onCancel: () => void;
  onSubmit: (exercise: Exercise) => void;
}
