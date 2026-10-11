import type {
  PerformanceWeights,
  SetType,
  ExerciseWeight,
  ExerciseRepRange,
} from "../../db";

export interface DraftSetData {
  type: SetType;
  weight: number | undefined;
  reps: number | undefined;
}

export interface CompletedSetData {
  type: SetType;
  weight: number;
  reps: number;
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
  previousSets: CompletedSetData[];
  exerciseWeights?: ExerciseWeight;
  exerciseReps?: ExerciseRepRange;
  performanceWeights?: PerformanceWeights;
  selfWeight?: number;
}
