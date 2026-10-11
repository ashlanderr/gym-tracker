import { maxBy } from "../../db";
import { addSelfWeight, stepWeightKg } from "../weights";
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

// The weight goes up one step of the inventory when every working set of the
// last time was done with the working weight, reached the top of the range,
// and the equipment has a heavier weight.
export function computeWeightIncrease(
  previousSets: CompletedSetData[],
  reps: RepRange,
  context: WeightContext & { fallbackStepKg: number },
): WeightIncrease | null {
  const working = previousSets.filter((s) => s.type === "working");
  const from = computeWorkingWeight(previousSets, reps, context);
  if (from === undefined) return null;

  const isDone = working.every(
    (s) => Math.abs(s.weight - from) < EPSILON && s.reps >= reps.max,
  );
  if (!isDone) return null;

  const direction = context.exerciseWeights?.type === "negative" ? -1 : 1;
  const to = stepWeightKg(
    context.performanceWeights,
    from,
    direction,
    context.fallbackStepKg,
  );

  return full(context, to) > full(context, from) + EPSILON
    ? { from, to }
    : null;
}

function full(context: WeightContext, weight: number): number {
  return addSelfWeight(context.exerciseWeights, context.selfWeight, weight);
}
