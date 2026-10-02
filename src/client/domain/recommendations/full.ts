import type { Exercise, Gym } from "../../db";
import {
  addSelfWeight,
  type RoundingMode,
  snapWeightKg,
  subtractSelfWeight,
} from "../weights";

// What the body actually moves: the recorded weight with the body and the
// hidden weight of a plate-loaded machine. Every inner calculation works on
// it; the person only ever sees the recorded weight.
export function toFullWeight(
  exercise: Exercise,
  selfWeight: number | undefined,
  weightKg: number,
): number {
  return (
    addSelfWeight(exercise.weight, selfWeight, weightKg) +
    hiddenWeight(exercise)
  );
}

export function fromFullWeight(
  exercise: Exercise,
  selfWeight: number | undefined,
  fullKg: number,
): number {
  return subtractSelfWeight(
    exercise.weight,
    selfWeight,
    fullKg - hiddenWeight(exercise),
  );
}

// An assisting machine is lighter with more help, so its rounding goes the
// other way.
export function lighterRounding(exercise: Exercise): RoundingMode {
  return exercise.weight.type === "negative" ? "ceil" : "floor";
}

// Without an external weight there is nothing to round: it is always zero.
export function snapRecordedKg(
  exercise: Exercise,
  gym: Gym,
  weightKg: number,
  rounding: RoundingMode,
): number {
  if (exercise.load.type === "none") return 0;
  return snapWeightKg(exercise, gym, weightKg, rounding);
}

function hiddenWeight(exercise: Exercise): number {
  return exercise.load.type === "plates" ? exercise.load.base : 0;
}
