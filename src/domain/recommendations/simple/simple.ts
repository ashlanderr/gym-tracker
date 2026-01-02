import type {
  CompletedSetData,
  DraftSetData,
  RecommendationParams,
  RecSetData,
} from "../types.ts";
import {
  DEFAULT_WEIGHT_DROP,
  MIN_REPS,
  WARM_UP_SETS,
  WEIGHT_ROUNDING,
} from "./constants.ts";
import {
  addSelfWeight,
  oneRepMaxToWeight,
  snapWeightKg,
  subtractSelfWeight,
  volumeToOneRepMax,
} from "../../weights";
import { DEFAULT_EXERCISE_REPS, DEFAULT_EXERCISE_WEIGHT } from "../../../db";

export function buildRecommendations(
  params: RecommendationParams,
): RecSetData[] {
  const { currentSets, previousSets } = params;

  const currWorkingSets = currentSets.filter((s) => s.type !== "warm-up");
  const prevWorkingSets = previousSets.filter((s) => s.type !== "warm-up");
  const warmUpSets = currentSets.filter((s) => s.type === "warm-up");
  const result: RecSetData[] = [];
  let warmUpIndex = 0;
  let workingIndex = 0;

  for (const set of currentSets) {
    switch (set.type) {
      case "warm-up": {
        const warmUp = computeWarmUpSet(
          params,
          currWorkingSets[workingIndex],
          prevWorkingSets[workingIndex],
          warmUpSets.length,
          warmUpIndex,
        );
        result.push(warmUp);
        warmUpIndex += 1;
        break;
      }

      default: {
        const working = computeWorkingSet(
          params,
          prevWorkingSets,
          currWorkingSets,
          workingIndex,
        );
        workingIndex += 1;
        result.push(working);
        break;
      }
    }
  }

  return result;
}

function computeWarmUpSet(
  params: RecommendationParams,
  currentWorking: DraftSetData | undefined,
  previousWorking: DraftSetData | undefined,
  count: number,
  index: number,
): RecSetData {
  let working: DraftSetData | undefined = undefined;

  if (currentWorking?.weight !== undefined) {
    working = currentWorking;
  } else if (previousWorking?.weight !== undefined) {
    working = previousWorking;
  }

  if (!working) {
    return {
      type: "warm-up",
      weight: undefined,
      reps: undefined,
    };
  }

  const { exerciseWeights, selfWeight, performanceWeights } = params;

  let weight: number | undefined = undefined;
  let reps: number | undefined = undefined;

  const template = WARM_UP_SETS.at(count - 1)?.at(index);
  const warmUpMax = working.weight
    ? addSelfWeight(exerciseWeights, selfWeight, working.weight)
    : undefined;

  if (warmUpMax && template) {
    reps = template.reps;
    weight = subtractSelfWeight(
      exerciseWeights,
      selfWeight,
      warmUpMax * template.weight,
    );
    weight = snapWeightKg(performanceWeights, weight);
  }

  return {
    type: "warm-up",
    weight,
    reps: reps ? { min: reps, max: reps } : undefined,
  };
}

function computeWorkingSet(
  params: RecommendationParams,
  prevWorkingSets: CompletedSetData[],
  currWorkingSets: DraftSetData[],
  workingIndex: number,
): RecSetData {
  const { exerciseWeights, selfWeight, exerciseReps, performanceWeights } =
    params;

  const prevUpRepMax = computeRepMax(params, prevWorkingSets[workingIndex - 1]);
  const prevSelfRepMax = computeRepMax(params, prevWorkingSets[workingIndex]);
  const currUpRepMax = computeRepMax(params, currWorkingSets[workingIndex - 1]);

  const weightDrop =
    prevUpRepMax !== undefined && prevSelfRepMax !== undefined
      ? Math.min(prevSelfRepMax / prevUpRepMax, 1)
      : DEFAULT_WEIGHT_DROP;

  let currSelfRepMax: number | undefined = undefined;
  if (currUpRepMax !== undefined) {
    currSelfRepMax = currUpRepMax * weightDrop;
  } else if (prevSelfRepMax !== undefined) {
    currSelfRepMax = prevSelfRepMax;
  }

  if (currSelfRepMax === undefined) {
    return { type: "working", weight: undefined, reps: undefined };
  }

  const weightType = exerciseWeights?.type ?? DEFAULT_EXERCISE_WEIGHT.type;
  const minReps = MIN_REPS[exerciseReps ?? DEFAULT_EXERCISE_REPS];
  const rounding = WEIGHT_ROUNDING[weightType];
  const fullWeight = oneRepMaxToWeight(currSelfRepMax, minReps);
  const weight = subtractSelfWeight(exerciseWeights, selfWeight, fullWeight);
  const roundedWeight = snapWeightKg(performanceWeights, weight, rounding);

  return { type: "working", weight: roundedWeight, reps: undefined };
}

function computeRepMax(
  params: RecommendationParams,
  set: DraftSetData | undefined,
): number | undefined {
  const { exerciseWeights, selfWeight } = params;
  return set?.weight !== undefined && set?.reps !== undefined
    ? volumeToOneRepMax(
        addSelfWeight(exerciseWeights, selfWeight, set.weight),
        set.reps,
      )
    : undefined;
}
