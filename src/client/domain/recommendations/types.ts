import type { Exercise, Gym, RepRange, SetType } from "../../db";

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

export interface RecSetData {
  type: SetType;
  weight: number | undefined;
  reps: RepRange | undefined;
}

export interface RecommendationParams {
  currentSets: DraftSetData[];
  previousSets: CompletedSetData[];
  exercise: Exercise;
  gym: Gym;
  reps: RepRange;
  selfWeight?: number;
}
