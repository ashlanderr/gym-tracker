import type { Workout } from "../../../../db";

export interface CompleteWorkoutData {
  name: string;
}

export interface CompleteWorkoutModalProps {
  workout: Workout;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CompleteWorkoutData) => void;
}
