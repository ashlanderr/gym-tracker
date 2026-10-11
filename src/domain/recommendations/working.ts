import { DEFAULT_EXERCISE_WEIGHT, DEFAULT_WEIGHT_UNITS, maxBy } from "../../db";
import {
  addSelfWeight,
  MANUAL_WEIGHT_STEP,
  oneRepMaxToReps,
  stepWeightKg,
  unitsToKg,
  volumeToOneRepMax,
} from "../weights";
import { TOP_REPS } from "./constants.ts";
import type {
  CompletedSetData,
  RepRange,
  WeightContext,
  WeightIncrease,
} from "./types.ts";

const EPSILON = 1e-6;

// The weight the exercise was done with the last time: the heaviest working
// set that reached the bottom of the range, by what the body moves, so on an
// assisting machine it is the least help. A heavy try that fell short does
// not set the weight of the next time.
export function computeWorkingWeight(
  previousSets: CompletedSetData[],
  reps: RepRange,
  context: WeightContext,
): number | undefined {
  const working = previousSets.filter((s) => s.type === "working");
  const inRange = working.filter((s) => s.reps >= reps.min);
  return maxBy(
    inRange.length > 0 ? inRange : working,
    (a, b) => full(context, a.weight) - full(context, b.weight),
  )?.weight;
}

// The range for a weight. Its top is where the next weight reaches the bottom
// by 1RM, so a set at the top means the next weight can be done in the range.
// The range of the exercise is only widened, never narrowed.
export function computeRepRange(
  weight: number | undefined,
  reps: RepRange,
  context: WeightContext,
): RepRange {
  const type = (context.exerciseWeights ?? DEFAULT_EXERCISE_WEIGHT).type;
  if (weight === undefined) return reps;
  if (type !== "full" && context.selfWeight === undefined) return reps;

  const current = full(context, weight);
  const next = full(context, nextWeight(context, weight));
  if (current <= 0 || next <= current + EPSILON) return reps;

  const top = Math.min(
    oneRepMaxToReps(volumeToOneRepMax(next, reps.min), current),
    TOP_REPS[TOP_REPS.length - 1],
  );
  const niceTop = TOP_REPS.find((r) => r >= top - EPSILON) ?? top;

  return { min: reps.min, max: Math.max(reps.max, niceTop) };
}

// The weight goes up one step of the inventory when every working set of the
// last time was done with the working weight, reached the top of its range,
// and the equipment has a heavier weight.
export function computeWeightIncrease(
  previousSets: CompletedSetData[],
  reps: RepRange,
  context: WeightContext,
): WeightIncrease | null {
  const working = previousSets.filter((s) => s.type === "working");
  const from = computeWorkingWeight(previousSets, reps, context);
  if (from === undefined) return null;

  const range = computeRepRange(from, reps, context);
  const isDone = working.every(
    (s) => Math.abs(s.weight - from) < EPSILON && s.reps >= range.max,
  );
  if (!isDone) return null;

  const to = nextWeight(context, from);
  return full(context, to) > full(context, from) + EPSILON
    ? { from, to, range }
    : null;
}

// One step of the inventory toward a heavier load: down on an assisting
// machine.
function nextWeight(context: WeightContext, weight: number): number {
  const units = context.performanceWeights?.units ?? DEFAULT_WEIGHT_UNITS;
  const direction = context.exerciseWeights?.type === "negative" ? -1 : 1;
  return stepWeightKg(
    context.performanceWeights,
    weight,
    direction,
    unitsToKg(MANUAL_WEIGHT_STEP, units),
  );
}

function full(context: WeightContext, weight: number): number {
  return addSelfWeight(context.exerciseWeights, context.selfWeight, weight);
}
