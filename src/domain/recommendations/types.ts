import type {
  PerformanceWeights,
  SetType,
  ExerciseWeight,
  PeriodizationData,
  RecordNumbers,
  ExerciseRepRange,
} from "../../db";

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
  exerciseReps?: ExerciseRepRange;
  performanceWeights?: PerformanceWeights;
  selfWeight?: number;
  oneRepMax?: RecordNumbers;
  periodization?: PeriodizationData;
}
