import type { Exercise, Performance, Record, Set } from "../../db";
import type { MuscleWork } from "../../domain";

export interface FinishInput {
  performances: Performance[];
  sets: Set[];
  records: Record[];
  exercises: Map<string, Exercise>;
}

export interface FinishEvent {
  type: "best_set" | "max_weight";
  exercise: Exercise;
  weight: number;
  reps: number;
}

export interface NextTimeItem {
  exercise: Exercise;
  weight: number;
}

export interface FinishSummary {
  completedSets: number;
  skippedSets: number;
  volume: number;
  muscleWork: MuscleWork[];
  events: FinishEvent[];
  nextTime: NextTimeItem[];
}
