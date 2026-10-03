import type { Exercise, Gym, Movement, RepRange } from "../../db";
import { computeWeights } from "../weights";
import { WARM_UP_SETS } from "./constants.ts";
import {
  fromFullWeight,
  lighterRounding,
  snapRecordedKg,
  toFullWeight,
} from "./full.ts";
import { isInventoryUnknown } from "./start.ts";

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
// so from a light weight there is no warm-up at all. Without the inventory
// nothing can be rounded or dropped, so there is none either. A barbell
// stays the one the working weight is on.
export function planWarmUps({
  exercise,
  gym,
  selfWeight,
  workingWeight,
  isFirstOfMovement,
}: WarmUpParams): WarmUpSet[] {
  if (!isFirstOfMovement || !hasWarmUp(exercise.movement)) return [];
  if (isInventoryUnknown(exercise, gym)) return [];

  const full = toFullWeight(exercise, selfWeight, workingWeight);
  const rounding = lighterRounding(exercise);
  const equipment = workingEquipment(exercise, gym, workingWeight);

  return WARM_UP_SETS.flatMap(({ weight, reps }) => {
    const target = fromFullWeight(exercise, selfWeight, full * weight);
    const snapped = snapRecordedKg(exercise, equipment, target, rounding);
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

function workingEquipment(
  exercise: Exercise,
  gym: Gym,
  workingWeight: number,
): Gym {
  const working = computeWeights(exercise, gym, workingWeight);
  if (working?.type !== "barbell") return gym;
  return { ...gym, bars: { units: working.units, items: [working.bar] } };
}

function hasWarmUp(movement: Movement | undefined): boolean {
  return movement !== undefined && movement !== "core";
}
