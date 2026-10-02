import type {
  Exercise,
  ExerciseAlternative,
  ExperienceLevel,
  Gym,
  Sex,
} from "../../db";
import { weightLimitsKg } from "../weights";
import { snapRecordedKg, toFullWeight } from "./full.ts";

const EPSILON = 1e-6;

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

// The minimum of the exercise in this gym when it is heavier than the safe
// weight, as a recorded weight; null when there is no conflict or it cannot
// be known yet. Pull-ups and dips compare the body itself.
export function findMinimumConflict(
  exercise: Exercise,
  gym: Gym,
  sex: Sex | undefined,
  selfWeight: number | undefined,
): number | null {
  const safe = sex ? exercise.safeStart?.[sex] : undefined;
  const limits = weightLimitsKg(exercise, gym);
  if (safe === undefined || !limits) return null;

  const minimum = toFullWeight(exercise, selfWeight, limits.min);
  return minimum > safe + EPSILON ? limits.min : null;
}

// The warning is for those who are only starting: the others know a bar and
// decide for themselves.
export function isWarnedOfMinimum(level: ExperienceLevel | undefined): boolean {
  return level === "novice";
}

export interface SafeAlternative extends ExerciseAlternative {
  exercise: Exercise;
}

// Replacements without the same conflict, as far as it is known: an
// exercise whose inventory is unknown yet is offered, and the warning comes
// back before its set if the conflict shows up. The Smith machine is safe,
// but its carriage may weigh what the bar does, so it goes last.
export function safeAlternatives(
  alternatives: SafeAlternative[],
  gym: Gym,
  sex: Sex | undefined,
  selfWeight: number | undefined,
): SafeAlternative[] {
  const isSmith = ({ exercise }: SafeAlternative) =>
    exercise.equipment.includes("smith");

  return alternatives
    .filter(
      ({ exercise }) =>
        findMinimumConflict(exercise, gym, sex, selfWeight) === null,
    )
    .sort((a, b) => Number(isSmith(a)) - Number(isSmith(b)));
}
