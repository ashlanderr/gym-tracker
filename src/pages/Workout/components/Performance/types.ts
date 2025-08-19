import type {
  Performance,
  PerformanceWeights,
  WeightUnits,
  SetType,
  ExerciseWeight,
} from "../../../../db";

export interface PerformanceProps {
  performance: Performance;
}

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

export interface RecommendationParams {
  prevSets: CompletedSetData[];
  currentSets: DraftSetData[];
  exerciseWeights?: ExerciseWeight;
  performanceWeights?: PerformanceWeights;
  selfWeight?: number;
  progression?: number;
}

export interface WeightsConstructor {
  units: WeightUnits;
  totalKg: number;
  totalUnits: number;
  count: number;
  base?: number;
  steps?: Array<{
    weight: number;
    count: number;
  }>;
}
