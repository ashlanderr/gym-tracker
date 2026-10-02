import type { Effort, Exercise, Gym, RepRange, SetType, Sex } from "../../db";

export interface SetData {
  type: SetType;
  weight: number | undefined;
  reps: number | undefined;
  completed: boolean;
  effort?: Effort;
}

export interface CompletedSetData {
  type: SetType;
  weight: number;
  reps: number;
  effort?: Effort;
}

// Why weight finding changed the weight: the rating of the set before, or
// the equipment that has nothing heavier.
export type FindingReason = "light" | "easy" | "below" | "max";

export interface RecSetData {
  type: SetType;
  weight: number | undefined;
  reps: RepRange | undefined;
  // The set is done while the weight is still being found.
  isFinding: boolean;
  reason?: FindingReason;
}

export interface RecommendationParams {
  // The sets of this performance, in order.
  currentSets: SetData[];
  // Completed sets of earlier performances of the exercise, oldest first.
  previousSets: CompletedSetData[];
  exercise: Exercise;
  gym: Gym;
  reps: RepRange;
  sex: Sex | undefined;
  selfWeight: number | undefined;
  isFirstOfMovement: boolean;
}
