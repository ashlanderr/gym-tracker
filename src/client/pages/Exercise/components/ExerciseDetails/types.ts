import type { Exercise } from "../../../../db";

export interface ExerciseDetailsProps {
  exercise: Exercise;
  onReplace: ((exercise: string) => void) | undefined;
}
