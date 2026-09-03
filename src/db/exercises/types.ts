export type MuscleType =
  | "abs"
  | "abductors"
  | "adductors"
  | "biceps"
  | "calves"
  | "chest"
  | "forearms"
  | "glutes"
  | "hamstrings"
  | "lats"
  | "lower_back"
  | "neck"
  | "quadriceps"
  | "shoulders"
  | "traps"
  | "triceps"
  | "upper_back";

export type EquipmentType =
  | "none"
  | "barbell"
  | "dumbbell"
  | "machine"
  | "plates";

export type ExerciseRepRangeSimple = "low" | "medium" | "high";
export type ExerciseRepRangeCustom = { min: number; max: number };
export type ExerciseRepRange = ExerciseRepRangeSimple | ExerciseRepRangeCustom;

export interface Exercise {
  id: string;
  name: string;
  muscles: MuscleType[];
  equipment?: EquipmentType;
  weight?: ExerciseWeight;
  reps?: ExerciseRepRange;
}

export type ExerciseWeight =
  | { type: "full" }
  | { type: "positive"; selfWeightPercent: number }
  | { type: "negative"; selfWeightPercent: number };
