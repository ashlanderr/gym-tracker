import type { Exercise, Performance } from "../../../../db";

export interface PerformanceActionsData {
  performance: Performance;
  exercise: Exercise | null;
}
