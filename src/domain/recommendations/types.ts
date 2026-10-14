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

export type SetMove = "start" | "same" | "up" | "down";

export type SetResult = "top" | "range" | "short";

export interface SetStep {
  weight: number;
  reps: number;
  move: SetMove;
  result: SetResult;
}

export interface LastTime {
  steps: SetStep[];
  weight: number | undefined;
}

export type MixedReason = "continue" | "limit" | "back";

export type WeightChange = (
  | { type: "increase"; from: number; to: number; range: RepRange }
  | { type: "decrease"; from: number; to: number; range: RepRange }
  | { type: "lightest"; weight: number; range: RepRange }
  | { type: "mixed"; weight: number; range: RepRange; reason: MixedReason }
) & { steps: SetStep[] };
