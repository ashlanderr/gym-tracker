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

export interface ExerciseSummary {
  performance: string;
  exercise: string;
  done: number;
  total: number;
  best: { weight: number; reps: number } | null;
}
