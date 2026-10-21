import type { Workout } from "../../../../db";

export type WorkoutAction = "open" | "duplicate" | "schedule" | "delete";

export interface WorkoutActionsData {
  workout: Workout;
  // A new workout can't start while another one is active.
  canDuplicate: boolean;
}
