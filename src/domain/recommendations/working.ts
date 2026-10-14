import { DEFAULT_EXERCISE_WEIGHT, DEFAULT_WEIGHT_UNITS } from "../../db";
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
  WeightChange,
  WeightContext,
  WeightPattern,
} from "./types.ts";

const EPSILON = 1e-6;

// The weight the exercise was done with the last time: the last working set
// that reached the bottom of the range, the last choice of the person that
// worked. The sets after it fell short, the sets before it led to it. When no
// set reached the bottom, the last set.
export function computeWorkingWeight(
  previousSets: CompletedSetData[],
  reps: RepRange,
): number | undefined {
  const working = previousSets.filter((s) => s.type === "working").reverse();
  return (working.find((s) => s.reps >= reps.min) ?? working.at(0))?.weight;
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
  const next = full(context, stepLoad(context, weight, 1));
  if (current <= 0 || next <= current + EPSILON) return reps;

  const top = Math.min(
    oneRepMaxToReps(volumeToOneRepMax(next, reps.min), current),
    TOP_REPS[TOP_REPS.length - 1],
  );
  const niceTop = TOP_REPS.find((r) => r >= top - EPSILON) ?? top;

  return { min: reps.min, max: Math.max(reps.max, niceTop) };
}

// What happens to the working weight, judged by the sets done with it. A set
// below the bottom of the range rolls it back one step of the inventory, or
// says there is nothing lighter. Every set at the top, all with the working
// weight, raises it one step: double progression needs the weight passed in
// full. Otherwise the weight stays, and when the last time had other weights
// the choice of this one needs an explanation.
export function computeWeightChange(
  previousSets: CompletedSetData[],
  reps: RepRange,
  context: WeightContext,
): WeightChange | null {
  const working = previousSets.filter((s) => s.type === "working");
  const weight = computeWorkingWeight(previousSets, reps);
  if (weight === undefined) return null;

  const range = computeRepRange(weight, reps, context);
  const atWeight = working.filter((s) => isSame(s.weight, weight));

  if (atWeight.some((s) => s.reps < range.min)) {
    const to = stepLoad(context, weight, -1);
    return full(context, to) < full(context, weight) - EPSILON
      ? { type: "decrease", from: weight, to, range }
      : { type: "lightest", weight, range };
  }

  if (atWeight.length < working.length) {
    return {
      type: "mixed",
      weight,
      range,
      pattern: computePattern(working, range, context),
    };
  }

  if (working.every((s) => s.reps >= range.max)) {
    const to = stepLoad(context, weight, 1);
    if (full(context, to) > full(context, weight) + EPSILON) {
      return { type: "increase", from: weight, to, range };
    }
  }

  return null;
}

// What the weights of the last time looked like, to explain the choice. A
// weight held in a row is the one the workout stood on; the weights after it
// went above or below. With more than two weights, or none held, the weight
// was being picked, and only that is told.
function computePattern(
  working: CompletedSetData[],
  range: RepRange,
  context: WeightContext,
): WeightPattern {
  const weights = new Set(working.map((s) => s.weight));
  const start = working.findIndex(
    (s, i) => i > 0 && isSame(s.weight, working[i - 1].weight),
  );
  if (weights.size > 2 || start < 0) return { type: "search" };

  const held = working[start].weight;
  const after = working.slice(start).filter((s) => !isSame(s.weight, held));
  const other = after.at(0)?.weight;
  if (other === undefined) return { type: "settled" };

  const isAbove = full(context, other) > full(context, held);
  const isHeldShort = working.some(
    (s) => isSame(s.weight, held) && s.reps < range.min,
  );
  return { type: isAbove ? "above" : "below", held, other, isHeldShort };
}

function isSame(a: number, b: number): boolean {
  return Math.abs(a - b) < EPSILON;
}

// One step of the inventory toward a heavier or a lighter load: on an
// assisting machine a heavier load is less help.
function stepLoad(
  context: WeightContext,
  weight: number,
  load: 1 | -1,
): number {
  const units = context.performanceWeights?.units ?? DEFAULT_WEIGHT_UNITS;
  const direction = context.exerciseWeights?.type === "negative" ? -load : load;
  return stepWeightKg(
    context.performanceWeights,
    weight,
    direction as 1 | -1,
    unitsToKg(MANUAL_WEIGHT_STEP, units),
  );
}

function full(context: WeightContext, weight: number): number {
  return addSelfWeight(context.exerciseWeights, context.selfWeight, weight);
}
