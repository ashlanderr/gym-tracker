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
// set, by what the body moves, so on an assisting machine it is the least
// help.
export function computeWorkingWeight(
  previousSets: CompletedSetData[],
  context: WeightContext,
): number | undefined {
  const working = previousSets.filter((s) => s.type === "working");
  return maxBy(
    working,
    (a, b) => full(context, a.weight) - full(context, b.weight),
  )?.weight;
}

// The weight goes up one step of the inventory when every working set of the
// last time reached the top of the range and the equipment has a heavier
// weight.
export function computeWeightIncrease(
  previousSets: CompletedSetData[],
  reps: RepRange,
  context: WeightContext & { fallbackStepKg: number },
): WeightIncrease | null {
  const working = previousSets.filter((s) => s.type === "working");
  if (working.length === 0 || working.some((s) => s.reps < reps.max)) {
    return null;
  }

  const from = computeWorkingWeight(previousSets, context);
  if (from === undefined) return null;

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
