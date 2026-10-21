import type { Workout, WorkoutRepeat } from "../../../../db";

export type RepeatMode = "none" | "weekly" | "days";

export interface ScheduleSheetData {
  workout: Workout;
  // The day the rule counts from.
  from: string;
  today: string;
}

export interface ScheduleSheetResult {
  rule: Omit<WorkoutRepeat, "id"> | null;
}
