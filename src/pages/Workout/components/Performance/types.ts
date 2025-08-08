import type {
  Performance,
  PerformanceWeights,
  WeightUnits,
} from "../../../../db/performances.ts";
import type { SetType } from "../../../../db/sets.ts";
import type { ExerciseWeight } from "../../../../db/exercises.ts";

export interface PerformanceProps {
  performance: Performance;
}

export interface WorkingVolume {
  weight: number;
  reps: number;
  oneRepMax: number;
}

export interface SetData {
  type: SetType;
  weight: number;
  reps: number;
  weights?: WeightsConstructor;
}

export interface RecommendationParams {
  prevSets: SetData[];
  currentSets: SetData[];
  exerciseWeights?: ExerciseWeight;
  performanceWeights?: PerformanceWeights;
  selfWeight?: number;
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
  additional?: number;
}
