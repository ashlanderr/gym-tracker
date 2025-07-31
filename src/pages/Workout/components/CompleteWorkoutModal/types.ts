import type { Workout } from "../../../../db/workouts.ts";

export interface CompleteWorkoutData {
  name: string;
}

export interface CompleteWorkoutModalProps {
  workout: Workout;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CompleteWorkoutData) => void;
}
