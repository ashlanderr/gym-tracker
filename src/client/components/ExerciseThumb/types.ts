import type { Exercise } from "../../db";

export interface ExerciseThumbProps {
  exercise: Exercise;
  onClick?: () => void;
}
