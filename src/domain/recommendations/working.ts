import { DEFAULT_EXERCISE_WEIGHT, DEFAULT_WEIGHT_UNITS } from "../../db";
import {
  addSelfWeight,
  MANUAL_WEIGHT_STEP,
  minimumWeightKg,
  oneRepMaxToReps,
  oneRepMaxToWeight,
  snapWeightKg,
  stepWeightKg,
  subtractSelfWeight,
  unitsToKg,
  volumeToOneRepMax,
} from "../weights";
import { TOP_REPS } from "./constants.ts";
import type { CompletedSetData, RepRange, WeightContext } from "./types.ts";

const EPSILON = 1e-6;

// The weight of the next time, read from the working sets of the last time.
// It is the weight of the last set: the last choice of the person, also when
// they lowered it themselves. A last set below the bottom of the range brings
// it back into the range by 1RM. Every set at the top, all with that weight,
// raises it one step: double progression needs the weight passed in full.
export function computeWorkingWeight(
  previousSets: CompletedSetData[],
  reps: RepRange,
  context: WeightContext,
): number | undefined {
  const working = previousSets.filter((s) => s.type === "working");
  const last = working.at(-1);
  if (!last) return undefined;

  if (last.reps < reps.min) return backToRange(last, reps, context);

  const isPassed = working.every(
    (s) =>
      isSame(s.weight, last.weight) &&
      s.reps >= computeRepRange(s.weight, reps, context).max,
  );
  if (!isPassed) return last.weight;

  const next = stepLoad(context, last.weight);
  return full(context, next) > full(context, last.weight) + EPSILON
    ? next
    : last.weight;
}

// The weight where the 1RM of a short set gives the bottom of the range, put
// together from the inventory toward a lighter load and never below its
// lightest weight. Without the weight of the body the load is unknown.
function backToRange(
  set: CompletedSetData,
  reps: RepRange,
  context: WeightContext,
): number | undefined {
  const { exerciseWeights, selfWeight, performanceWeights } = context;
  const type = (exerciseWeights ?? DEFAULT_EXERCISE_WEIGHT).type;
  if (type !== "full" && selfWeight === undefined) return undefined;

  const oneRepMax = volumeToOneRepMax(full(context, set.weight), set.reps);
  const weight = subtractSelfWeight(
    exerciseWeights,
    selfWeight,
    oneRepMaxToWeight(oneRepMax, reps.min),
  );
  const lighter = type === "negative" ? "ceil" : "floor";

  if (!performanceWeights) {
    const steps = weight / MANUAL_WEIGHT_STEP;
    const snapped =
      lighter === "ceil"
        ? Math.ceil(steps - EPSILON)
        : Math.floor(steps + EPSILON);
    return Math.max(0, snapped * MANUAL_WEIGHT_STEP);
  }

  return Math.max(
    snapWeightKg(performanceWeights, weight, lighter),
    minimumWeightKg(performanceWeights),
  );
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
  const next = full(context, stepLoad(context, weight));
  if (current <= 0 || next <= current + EPSILON) return reps;

  const top = Math.min(
    oneRepMaxToReps(volumeToOneRepMax(next, reps.min), current),
    TOP_REPS[TOP_REPS.length - 1],
  );
  const niceTop = TOP_REPS.find((r) => r >= top - EPSILON) ?? top;

  return { min: reps.min, max: Math.max(reps.max, niceTop) };
}

function isSame(a: number, b: number): boolean {
  return Math.abs(a - b) < EPSILON;
}

// One step of the inventory toward a heavier load: on an assisting machine a
// heavier load is less help.
function stepLoad(context: WeightContext, weight: number): number {
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
