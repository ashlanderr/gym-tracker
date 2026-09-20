import { DEFAULT_EXERCISE_WEIGHT, type Exercise } from "../types.ts";
import type { ExerciseGroup } from "./types.ts";

// A longer list of alternatives is not a better one: past this many the tail
// is always a worse fit than what the user would pick by hand.
const MAX_ALTERNATIVES = 5;

export function buildExercises(
  groups: ExerciseGroup[],
): Record<string, Exercise> {
  const benefits = new Map<string, string>();

  for (const group of groups) {
    for (const [id, definition] of Object.entries(group.exercises)) {
      benefits.set(id, definition.benefit);
    }
  }

  const exercises: Record<string, Exercise> = {};

  for (const group of groups) {
    const ids = Object.keys(group.exercises);

    for (const [id, definition] of Object.entries(group.exercises)) {
      const alternatives = [
        ...(definition.related ?? []),
        ...ids.filter((sibling) => sibling !== id),
      ]
        .slice(0, MAX_ALTERNATIVES)
        .map((alternative) => ({
          id: alternative,
          benefits: benefits.get(alternative) ?? "",
        }));

      exercises[id] = {
        id,
        name: definition.name,
        primaryMuscles: definition.primaryMuscles,
        secondaryMuscles: definition.secondaryMuscles ?? [],
        equipment: definition.equipment,
        load: definition.load,
        weight: definition.weight ?? DEFAULT_EXERCISE_WEIGHT,
        reps: definition.reps,
        asset: definition.asset,
        instructions: definition.instructions,
        alternatives,
      };
    }
  }

  return exercises;
}
