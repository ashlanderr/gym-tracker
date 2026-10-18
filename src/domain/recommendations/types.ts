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

export type RepRange = ExerciseRepRange;

export interface RecSetData {
  type: SetType;
  weight: number | undefined;
  reps: RepRange | undefined;
}

export interface WeightContext {
  exerciseWeights?: ExerciseWeight;
  performanceWeights?: PerformanceWeights;
  selfWeight?: number;
}

export interface RecommendationParams extends WeightContext {
  currentSets: DraftSetData[];
  previousSets: CompletedSetData[];
  exerciseReps: RepRange;
}
