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

export type EquipmentTag = "barbell" | "dumbbell" | "machine" | "bench";

// How the weight of the exercise is assembled from the gym inventory.
// Plate-loaded machines rarely have the sled weight written on them,
// so for `plates` only the plates are counted.
export type ExerciseLoad =
  | { type: "none" }
  | { type: "barbell" }
  | { type: "dumbbell"; count: 1 | 2 }
  | { type: "stack" }
  | { type: "plates"; sides: 1 | 2 };

export type ExerciseAsset =
  | { type: "video"; url: string }
  | { type: "image"; url: string };

export interface Exercise {
  id: string;
  name: string;
  primaryMuscles: MuscleType[];
  secondaryMuscles: MuscleType[];
  equipment: EquipmentTag[];
  load: ExerciseLoad;
  weight: ExerciseWeight;
  reps: RepRange;
  asset?: ExerciseAsset;
  alternatives: ExerciseAlternative[];
  instructions: string[];
}

export interface ExerciseAlternative {
  id: string;
  benefits: string;
}

export interface RepRange {
  min: number;
  max: number;
}

export type ExerciseWeight =
  | { type: "full" }
  | { type: "positive"; selfWeightPercent: number }
  | { type: "negative"; selfWeightPercent: number };
