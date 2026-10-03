import type { Exercise, Gym, Sex } from "../../db";
import { weightLimitsKg } from "../weights";
import { snapRecordedKg } from "./full.ts";

// Whether the gym inventory this exercise needs is still unknown: the
// inventory page opens before its first set.
export function isInventoryUnknown(exercise: Exercise, gym: Gym): boolean {
  return exercise.load.type !== "none" && !weightLimitsKg(exercise, gym);
}

// The weight of the first set when the exercise has no history. Barbells and
// dumbbells start from the safe weight, rounded down within the equipment;
// an assisting machine from the most help; everything else from its
// lightest weight.
export function startWeightKg(
  exercise: Exercise,
  gym: Gym,
  sex: Sex | undefined,
): number {
  if (exercise.weight.type === "negative") {
    return weightLimitsKg(exercise, gym)?.max ?? 0;
  }

  const safe =
    exercise.weight.type === "full" && sex ? exercise.safeStart?.[sex] : 0;
  return snapRecordedKg(exercise, gym, safe ?? 0, "floor");
}
