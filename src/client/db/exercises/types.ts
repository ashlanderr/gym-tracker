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

export type EquipmentTag =
  | "barbell"
  | "dumbbell"
  | "machine"
  | "cable"
  | "smith"
  | "bench"
  | "bodyweight";

// How the weight of the exercise is assembled from the gym inventory.
// Plate-loaded machines and the Smith machine rarely have the sled or the bar
// weight written on them, so the recorded weight is only the plates. `base`
// is an estimate of the rest: never shown or recorded, it only lets the
// inner calculations scale an empty machine.
export type ExerciseLoad =
  | { type: "none" }
  | { type: "barbell" }
  | { type: "dumbbell"; count: 1 | 2 }
  | { type: "stack" }
  | { type: "plates"; sides: 1 | 2; base: number };

// Movement group for the warm-up: only the first exercise of a group in a
// workout is warmed up. Core goes without a warm-up.
export type Movement = "push" | "pull" | "squat" | "hinge" | "core";

// Safe first weight for a novice, by sex: the recorded weight for barbells
// and dumbbells, the full weight with the body for pull-ups and dips.
export type SafeStart = Record<"male" | "female", number>;

// A cross-fade is two stills of the same shot — the start and the end of the
// movement — that the UI fades between.
//
// This replaced a baked video, and deliberately so. Fading between two images
// is a few lines of CSS, so the clip bought nothing in effort; meanwhile the
// frames are the artwork itself, while a video is a render of it. From an mp4
// the stills cannot be recovered, so changing the timing, the crop or the
// aspect ratio would mean re-encoding from masters that would have to be kept
// alongside the video anyway — paying for the same content twice. Keeping only
// the frames leaves the source editable and the bundle smaller.
export type ExerciseAsset =
  | { type: "cross-fade"; startUrl: string; endUrl: string }
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
  // Custom exercises have no movement group and go without a warm-up.
  movement?: Movement;
  safeStart?: SafeStart;
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

export const DEFAULT_EXERCISE_WEIGHT: ExerciseWeight = { type: "full" };
