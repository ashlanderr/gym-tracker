import type { RecommendationParams, SetData, WorkingVolume } from "./types.ts";
import {
  DEFAULT_RANGE_MAX_REPS,
  DEFAULT_RANGE_MIN_REPS,
  EXTRA_RANGE_MIN_REPS,
  LIGHT_WEIGHT_MULTIPLIER,
  REPS_INCREASE_WEIGHT_MULTIPLIER,
  WARM_UP_SETS,
  WARM_UP_WEIGHT_MULTIPLIER,
  WEIGHT_INCREASE_MIN_REPS,
} from "./constants.ts";
import {
  addSelfWeight,
  snapWeightKg,
  subtractSelfWeight,
  oneRepMaxToWeight as oneRepMaxToWeightInner,
  oneRepMaxToReps as oneRepMaxToRepsInner,
  volumeToOneRepMax as volumeToOneRepMaxInner,
} from "../utils.ts";
import { assertNever } from "../../../../utils";
import type { SetType } from "../../../../db/sets.ts";

export function oneRepMaxToWeight(
  params: RecommendationParams,
  oneRepMax: number,
  reps: number,
): number {
  return subtractSelfWeight(
    params.exerciseWeights,
    params.selfWeight,
    oneRepMaxToWeightInner(oneRepMax, reps),
  );
}

export function oneRepMaxToReps(
  params: RecommendationParams,
  oneRepMax: number,
  weight: number,
): number {
  return oneRepMaxToRepsInner(
    oneRepMax,
    addSelfWeight(params.exerciseWeights, params.selfWeight, weight),
  );
}

function weightToOneRepMaxMultiplier(type: SetType): number {
  switch (type) {
    case "warm-up":
      return 1 / WARM_UP_WEIGHT_MULTIPLIER;

    case "light":
      return 1 / LIGHT_WEIGHT_MULTIPLIER;

    case "working":
    case "failure":
      return 1;
  }
}

function findWorkingVolume(
  params: RecommendationParams,
  workingSets: SetData[],
): WorkingVolume | undefined {
  if (workingSets.length === 0) return undefined;

  let totalOneRepMaxSum = 0;
  let totalWorkingWeight = Infinity;

  for (const set of workingSets) {
    const multiplier = weightToOneRepMaxMultiplier(set.type);
    const totalWeight = addSelfWeight(
      params.exerciseWeights,
      params.selfWeight,
      set.weight,
    );
    totalOneRepMaxSum += volumeToOneRepMaxInner(
      totalWeight * multiplier,
      set.reps,
    );
    totalWorkingWeight = Math.min(totalWorkingWeight, totalWeight);
  }

  const totalOneRepMax = totalOneRepMaxSum / workingSets.length;
  const workingReps = Math.round(
    oneRepMaxToRepsInner(totalOneRepMax, totalWorkingWeight),
  );
  const workingWeight = snapWeightKg(
    params.performanceWeights,
    subtractSelfWeight(
      params.exerciseWeights,
      params.selfWeight,
      totalWorkingWeight,
    ),
  );

  return {
    weight: workingWeight,
    reps: workingReps,
    oneRepMax: totalOneRepMax,
  };
}

function increaseReps(
  params: RecommendationParams,
  oneRepMax: number,
  weight: number,
): number {
  const newRepMax = oneRepMax * REPS_INCREASE_WEIGHT_MULTIPLIER;
  return Math.round(oneRepMaxToReps(params, newRepMax, weight));
}

export function buildRecommendations(params: RecommendationParams): SetData[] {
  const {
    prevSets,
    currentSets,
    performanceWeights,
    exerciseWeights,
    selfWeight,
  } = params;

  const currentWarmUpSets = currentSets.filter((s) => s.type === "warm-up");
  const prevWorkingSets = prevSets.filter((s) => s.type !== "warm-up");
  const warmUpTemplate = WARM_UP_SETS.at(currentWarmUpSets.length - 1) ?? [];
  const working = findWorkingVolume(params, prevWorkingSets);
  const result: SetData[] = [];
  let warmUpIndex = 0;
  let filledSet: SetData | undefined = undefined;

  for (const set of currentSets) {
    if (filledSet && filledSet.type !== set.type) {
      filledSet = undefined;
    }

    switch (set.type) {
      case "warm-up": {
        let weight = 0;
        let reps = 0;

        const template = warmUpTemplate.at(warmUpIndex);
        const warmUpMax = working
          ? working.oneRepMax * WARM_UP_WEIGHT_MULTIPLIER
          : undefined;

        if (warmUpMax && template && !set.weight && !set.reps) {
          reps = template.reps;
          weight = subtractSelfWeight(
            exerciseWeights,
            selfWeight,
            warmUpMax * template.weight,
          );
          weight = snapWeightKg(performanceWeights, weight);
        }

        result.push({
          type: "warm-up",
          weight,
          reps,
        });
        warmUpIndex += 1;
        break;
      }

      case "light": {
        let weight = 0;
        let reps = 0;

        const lightRepMax = working
          ? working.oneRepMax * LIGHT_WEIGHT_MULTIPLIER
          : undefined;

        if (set.weight && set.reps) {
          weight = set.weight;
          reps = set.reps;
        } else if (filledSet && !set.weight && !set.reps) {
          weight = filledSet.weight;
          reps = filledSet.reps;
        } else if (lightRepMax && !set.weight && !set.reps) {
          reps = DEFAULT_RANGE_MAX_REPS;
          weight = snapWeightKg(
            performanceWeights,
            oneRepMaxToWeight(params, lightRepMax, reps),
          );
        } else if (lightRepMax && set.weight && !set.reps) {
          weight = set.weight;
          reps = Math.round(oneRepMaxToReps(params, lightRepMax, weight));
        } else if (lightRepMax && !set.weight && set.reps) {
          reps = set.reps;
          weight = snapWeightKg(
            performanceWeights,
            oneRepMaxToWeight(params, lightRepMax, reps),
          );
        } else {
          weight = set.weight;
          reps = set.reps;
        }

        filledSet = {
          type: set.type,
          weight,
          reps,
        };
        result.push({
          type: "light",
          weight,
          reps,
        });
        break;
      }

      case "working":
      case "failure": {
        let weight = 0;
        let reps = 0;

        if (set.weight && set.reps) {
          weight = set.weight;
          reps = set.reps;
        } else if (filledSet && !set.weight && !set.reps) {
          weight = filledSet.weight;
          reps = filledSet.reps;
        } else if (working && !set.weight && !set.reps) {
          if (working.reps >= WEIGHT_INCREASE_MIN_REPS) {
            reps = DEFAULT_RANGE_MIN_REPS;
            weight = snapWeightKg(
              performanceWeights,
              oneRepMaxToWeight(params, working.oneRepMax, reps),
            );
            if (weight == working.weight) {
              reps = EXTRA_RANGE_MIN_REPS;
              weight = snapWeightKg(
                performanceWeights,
                oneRepMaxToWeight(params, working.oneRepMax, reps),
              );
            }
            if (weight == working.weight) {
              weight = working.weight;
              reps = increaseReps(params, working.oneRepMax, weight);
            }
          } else {
            weight = working.weight;
            reps = increaseReps(params, working.oneRepMax, weight);
            reps = Math.min(reps, DEFAULT_RANGE_MAX_REPS);
          }
        } else if (working && set.weight && !set.reps) {
          if (set.weight === working.weight) {
            weight = set.weight;
            reps = increaseReps(params, working.oneRepMax, weight);
          } else {
            weight = set.weight;
            reps = Math.round(
              oneRepMaxToReps(params, working.oneRepMax, weight),
            );
          }
        } else if (working && !set.weight && set.reps) {
          reps = set.reps;
          weight = snapWeightKg(
            performanceWeights,
            oneRepMaxToWeight(params, working.oneRepMax, reps),
          );
        } else {
          weight = set.weight;
          reps = set.reps;
        }

        filledSet = {
          type: set.type,
          weight,
          reps,
        };
        result.push(filledSet);
        break;
      }

      default:
        assertNever(set.type);
    }
  }

  return result;
}
