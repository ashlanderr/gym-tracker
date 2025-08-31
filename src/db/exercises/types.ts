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

export interface Exercise {
  id: string;
  name: string;
  muscles: MuscleType[];
  equipment?: EquipmentType;
  weight?: ExerciseWeight;
}

export type ExerciseWeight =
  | { type: "full" }
  | { type: "positive"; selfWeightPercent: number }
  | { type: "negative"; selfWeightPercent: number };
