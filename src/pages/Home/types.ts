import type { Workout } from "../../db";

export type DayMark = "done" | "active" | "planned";

// A day a repeating workout is due, with its latest repeat to start from.
export interface PlannedWorkout {
  template: Workout;
  missed: boolean;
}
