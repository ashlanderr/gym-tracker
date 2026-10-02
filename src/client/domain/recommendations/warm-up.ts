import type { Exercise, Gym, Movement, RepRange } from "../../db";
import { WARM_UP_SETS } from "./constants.ts";
import {
  fromFullWeight,
  lighterRounding,
  snapRecordedKg,
  toFullWeight,
} from "./full.ts";

const EPSILON = 1e-6;

export interface WarmUpSet {
  weight: number;
  reps: RepRange;
}

export interface WarmUpParams {
  exercise: Exercise;
  gym: Gym;
  selfWeight: number | undefined;
  workingWeight: number;
  isFirstOfMovement: boolean;
}

// The warm-up before the working weight. Only the first exercise of a
// movement group gets one; a set lighter than the equipment allows drops out,
// so from a light weight there is no warm-up at all.
export function planWarmUps({
  exercise,
  gym,
  selfWeight,
  workingWeight,
  isFirstOfMovement,
}: WarmUpParams): WarmUpSet[] {
  if (!isFirstOfMovement || !hasWarmUp(exercise.movement)) return [];

  const full = toFullWeight(exercise, selfWeight, workingWeight);
  const rounding = lighterRounding(exercise);

  return WARM_UP_SETS.flatMap(({ weight, reps }) => {
    const target = fromFullWeight(exercise, selfWeight, full * weight);
    const snapped = snapRecordedKg(exercise, gym, target, rounding);
    const isTooLight =
      rounding === "floor"
        ? target < -EPSILON || snapped > target + EPSILON
        : snapped < target - EPSILON;
    return isTooLight
      ? []
      : [{ weight: snapped, reps: { min: reps, max: reps } }];
  });
}

// Which earlier exercises of the workout decide whether this one is warmed
// up: its movement group already worked if any of them shares it.
export function isFirstOfMovement(
  exercise: Exercise,
  earlierExercises: Exercise[],
): boolean {
  return !earlierExercises.some((e) => e.movement === exercise.movement);
}

function hasWarmUp(movement: Movement | undefined): boolean {
  return movement !== undefined && movement !== "core";
}
