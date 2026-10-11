import type { Performance, Set } from "../../../../db";
import type { WorkoutStatus } from "../../../../domain";

export type ExerciseCardStatus = WorkoutStatus;

export interface ExerciseCardProps {
  performance: Performance;
  sets: Set[];
  status: ExerciseCardStatus;
  highlight?: "done" | "open";
  onClick?: () => void;
}
