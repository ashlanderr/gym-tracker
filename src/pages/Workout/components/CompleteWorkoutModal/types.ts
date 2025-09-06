import type { Workout } from "../../../../db";

export interface CompleteWorkoutResult {
  name: string;
}

export interface CompleteWorkoutData {
  workout: Workout;
  partial: boolean;
}
