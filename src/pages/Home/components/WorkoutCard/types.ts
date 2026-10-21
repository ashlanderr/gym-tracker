import type { Workout } from "../../../../db";

export interface WorkoutCardProps {
  workout: Workout;
  onClick: () => void;
}

export interface ActiveWorkoutCardProps {
  workout: Workout;
  onContinue: () => void;
  onCancel: () => void;
}
