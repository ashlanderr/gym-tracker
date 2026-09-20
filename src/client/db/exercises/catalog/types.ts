import type { Exercise, MuscleType, ExerciseWeight } from "../types.ts";

// One movement done with different equipment or grip. Members of a group are
// each other's alternatives, so the links are never written twice.
export interface ExerciseGroup {
  exercises: Record<string, ExerciseDefinition>;
}

// `benefit` answers "why pick this one" and belongs to the exercise itself,
// not to the pair: every link pointing here reuses the same phrase.
// `related` is for substitutes outside the group — a machine standing in for
// a barbell — and comes first in the list, before the group siblings.
export interface ExerciseDefinition
  extends Omit<
    Exercise,
    "id" | "alternatives" | "secondaryMuscles" | "weight"
  > {
  benefit: string;
  secondaryMuscles?: MuscleType[];
  weight?: ExerciseWeight;
  related?: string[];
}
