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
  LastTime,
  RepRange,
  SetMove,
  SetStep,
  WeightChange,
  WeightContext,
} from "./types.ts";

const EPSILON = 1e-6;

// The last time read set by set, the way a coach who was not there would
// read the record: where each set went from the one before and how it came
// out against the range. Along the way the working weight is the last set
// that reached the bottom of the range, the last choice of the person that
// worked; when no set reached it, the last set.
export function readLastTime(
  previousSets: CompletedSetData[],
  reps: RepRange,
  context: WeightContext,
): LastTime {
  const working = previousSets.filter((s) => s.type === "working");
  let weight: number | undefined;

  const steps = working.map((set, index): SetStep => {
    const range = computeRepRange(set.weight, reps, context);
    if (set.reps >= range.min) weight = set.weight;
    return {
      weight: set.weight,
      reps: set.reps,
      move: computeMove(context, set, working[index - 1]),
      result:
        set.reps < range.min
          ? "short"
          : set.reps >= range.max
            ? "top"
            : "range",
    };
  });

  return { steps, weight: weight ?? working.at(-1)?.weight };
}

export function computeWorkingWeight(
  previousSets: CompletedSetData[],
  reps: RepRange,
  context: WeightContext,
): number | undefined {
  return readLastTime(previousSets, reps, context).weight;
}

function computeMove(
  context: WeightContext,
  set: CompletedSetData,
  before: CompletedSetData | undefined,
): SetMove {
  if (!before) return "start";
  if (isSame(set.weight, before.weight)) return "same";
  return full(context, set.weight) > full(context, before.weight)
    ? "up"
    : "down";
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
// full. Otherwise the weight stays: silently when every set had it, and with
// the story of the last time when there were other weights. The story ends
// with why: the weight went back from where the last time started, a heavier
// one fell short, or the weight simply goes on.
export function computeWeightChange(
  previousSets: CompletedSetData[],
  reps: RepRange,
  context: WeightContext,
): WeightChange | null {
  const { steps, weight } = readLastTime(previousSets, reps, context);
  if (weight === undefined) return null;

  const range = computeRepRange(weight, reps, context);
  const atWeight = steps.filter((s) => isSame(s.weight, weight));

  if (atWeight.some((s) => s.result === "short")) {
    const to = stepLoad(context, weight, -1);
    return full(context, to) < full(context, weight) - EPSILON
      ? { type: "decrease", from: weight, to, range, steps }
      : { type: "lightest", weight, range, steps };
  }

  if (atWeight.length < steps.length) {
    const load = full(context, weight);
    const isBack = load < full(context, steps[0].weight) - EPSILON;
    const isLimit = steps.some(
      (s) => s.result === "short" && full(context, s.weight) > load,
    );
    const reason = isBack ? "back" : isLimit ? "limit" : "continue";
    return { type: "mixed", weight, range, steps, reason };
  }

  if (steps.every((s) => s.result === "top")) {
    const to = stepLoad(context, weight, 1);
    if (full(context, to) > full(context, weight) + EPSILON) {
      return { type: "increase", from: weight, to, range, steps };
    }
  }

  return null;
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
