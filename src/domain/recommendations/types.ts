import type { PerformanceWeights, SetType, ExerciseWeight } from "../../db";

export interface WorkingVolume {
  weight: number;
  reps: number;
  oneRepMax: number;
}

export interface CompletedSetData {
  type: SetType;
  weight: number;
  reps: number;
}

export interface DraftSetData {
  type: SetType;
  weight: number | undefined;
  reps: number | undefined;
}

export interface RepRange {
  min: number;
  max: number;
}

export interface RecSetData {
  type: SetType;
  weight: number | undefined;
  reps: RepRange | undefined;
}

export type PeriodizationMode = "light" | "medium" | "heavy";

export interface Periodization {
  counter: number;
  light: number;
  medium: number;
  heavy: number;
}

export interface RecommendationParams {
  prevSets: CompletedSetData[];
  currentSets: DraftSetData[];
  exerciseWeights?: ExerciseWeight;
  performanceWeights?: PerformanceWeights;
  selfWeight?: number;
  oneRepMax?: number;
  progression?: number;
  periodization?: Periodization;
}
