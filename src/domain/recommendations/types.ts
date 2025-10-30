import type {
  PerformanceWeights,
  SetType,
  ExerciseWeight,
  PeriodizationData,
  RecordNumbers,
} from "../../db";

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

export interface RecommendationParams {
  currentSets: DraftSetData[];
  exerciseWeights?: ExerciseWeight;
  performanceWeights?: PerformanceWeights;
  selfWeight?: number;
  oneRepMax?: RecordNumbers;
  periodization?: PeriodizationData;
}
