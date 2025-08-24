import type { PeriodizationMode } from "../../db";

export interface WorkoutParams {
  workoutId: string;
}

export type PeriodizationOrNone = PeriodizationMode | "none";
