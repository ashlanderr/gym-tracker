export type ExerciseMarkType =
  | "inventory"
  | "unknown"
  | "increase"
  | "decrease"
  | "mixed";

export interface ExerciseMarkProps {
  type: ExerciseMarkType;
}
