import type {
  CompletedSetData,
  RecommendationParams,
  DraftSetData,
  WorkingVolume,
} from "../types.ts";
import {
  DEFAULT_RANGE_MAX_REPS,
  DEFAULT_RANGE_MIN_REPS,
  LIGHT_WEIGHT_MULTIPLIER,
  DEFAULT_PROGRESSION,
  WARM_UP_SETS,
  WARM_UP_WEIGHT_MULTIPLIER,
  PROGRESSION_INCREASE,
  PROGRESSION_MAX,
  PROGRESSION_MIN,
} from "./constants.ts";
import {
  addSelfWeight,
  snapWeightKg,
  subtractSelfWeight,
  oneRepMaxToWeight as oneRepMaxToWeightInner,
  oneRepMaxToReps as oneRepMaxToRepsInner,
  volumeToOneRepMax as volumeToOneRepMaxInner,
} from "../../weights";
import { assertNever } from "../../../utils";

export function volumeToOneRepMax(
  params: RecommendationParams,
  weight: number,
  reps: number,
): number {
  return volumeToOneRepMaxInner(
    addSelfWeight(params.exerciseWeights, params.selfWeight, weight),
    reps,
  );
}

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

function findWorkingVolume(
  params: RecommendationParams,
  workingSets: CompletedSetData[],
): WorkingVolume | undefined {
  if (workingSets.length === 0) return undefined;

  let totalOneRepMaxSum = 0;
  let totalWorkingWeight = 0;

  for (const set of workingSets) {
    const totalWeight = addSelfWeight(
      params.exerciseWeights,
      params.selfWeight,
      set.weight,
    );
    totalOneRepMaxSum += volumeToOneRepMaxInner(totalWeight, set.reps);
    totalWorkingWeight = Math.max(totalWorkingWeight, totalWeight);
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

  return totalOneRepMax > 0
    ? {
        weight: workingWeight,
        reps: workingReps,
        oneRepMax: totalOneRepMax,
      }
    : undefined;
}

export function buildRecommendations(
  params: RecommendationParams,
): DraftSetData[] {
  const {
    prevSets,
    currentSets,
    performanceWeights,
    exerciseWeights,
    selfWeight,
  } = params;
  if (performanceWeights === undefined) return [];

  const progression = params.progression ?? DEFAULT_PROGRESSION;
  const currentWarmUpSets = currentSets.filter((s) => s.type === "warm-up");
  const prevWorkingSets = prevSets.filter((s) => s.type !== "warm-up");
  const warmUpTemplate = WARM_UP_SETS.at(currentWarmUpSets.length - 1) ?? [];
  const working = findWorkingVolume(params, prevWorkingSets);
  const result: DraftSetData[] = [];
  let warmUpIndex = 0;
  let topOneRepMax = Infinity;

  for (const set of currentSets) {
    switch (set.type) {
      case "warm-up": {
        let weight: number | undefined = undefined;
        let reps: number | undefined = undefined;

        const template = warmUpTemplate.at(warmUpIndex);
        const warmUpMax = working
          ? working.oneRepMax * WARM_UP_WEIGHT_MULTIPLIER
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

        result.push({
          type: "warm-up",
          weight,
          reps,
        });
        warmUpIndex += 1;
        break;
      }

      case "light": {
        let weight: number | undefined = undefined;
        let reps: number | undefined = undefined;

        const lightRepMax = working
          ? working.oneRepMax * LIGHT_WEIGHT_MULTIPLIER
          : undefined;

        if (lightRepMax !== undefined) {
          reps = DEFAULT_RANGE_MAX_REPS;
          weight = snapWeightKg(
            performanceWeights,
            oneRepMaxToWeight(params, lightRepMax, reps),
          );
        }

        result.push({
          type: set.type,
          weight,
          reps,
        });
        break;
      }

      case "working":
      case "failure": {
        let weight: number | undefined = undefined;
        let reps: number | undefined = undefined;

        if (working) {
          const nextRepMax = Math.min(
            working.oneRepMax * progression,
            topOneRepMax,
          );
          weight = working.weight;
          reps = Math.round(oneRepMaxToReps(params, nextRepMax, weight));
          if (reps > DEFAULT_RANGE_MAX_REPS) {
            const clampedRepMax = volumeToOneRepMax(
              params,
              weight,
              Math.max(DEFAULT_RANGE_MAX_REPS, working.reps),
            );
            const nextWeight = snapWeightKg(
              performanceWeights,
              oneRepMaxToWeight(params, clampedRepMax, DEFAULT_RANGE_MIN_REPS),
            );
            if (nextWeight !== weight) {
              reps = DEFAULT_RANGE_MIN_REPS;
              weight = nextWeight;
            }
          } else if (reps < DEFAULT_RANGE_MIN_REPS) {
            const nextWeight = snapWeightKg(
              performanceWeights,
              oneRepMaxToWeight(params, nextRepMax, DEFAULT_RANGE_MIN_REPS),
            );
            if (nextWeight !== weight) {
              reps = DEFAULT_RANGE_MIN_REPS;
              weight = nextWeight;
            }
          }
        }

        if (set.weight !== undefined && set.reps !== undefined) {
          topOneRepMax = volumeToOneRepMax(params, set.weight, set.reps);
        }

        result.push({
          type: set.type,
          weight,
          reps,
        });
        break;
      }

      default:
        assertNever(set.type);
    }
  }

  return result;
}

export function computeNextProgression(params: RecommendationParams): number {
  const oldProgression = params.progression ?? DEFAULT_PROGRESSION;

  const baseRecs = buildRecommendations({
    ...params,
    currentSets: [{ type: "working", weight: undefined, reps: undefined }],
  });

  const recSet = baseRecs.at(0);
  if (!recSet || recSet.weight === undefined || recSet.reps === undefined) {
    return oldProgression;
  }

  const recRepMax = volumeToOneRepMax(params, recSet.weight, recSet.reps);

  const currSets = params.currentSets.filter(
    (s): s is CompletedSetData =>
      s.type !== "warm-up" && s.weight !== undefined && s.reps !== undefined,
  );

  const currVolume = findWorkingVolume(params, currSets);
  const currRepMax = currVolume?.oneRepMax;
  if (currRepMax === undefined) {
    return oldProgression;
  }

  if (currRepMax >= recRepMax) {
    return Math.min(oldProgression * PROGRESSION_INCREASE, PROGRESSION_MAX);
  }

  const prevSets = params.prevSets.filter((s) => s.type !== "warm-up");

  const prevVolume = findWorkingVolume(params, prevSets);
  const prevRepMax = prevVolume?.oneRepMax;
  if (prevRepMax === undefined) {
    return oldProgression;
  }

  return Math.max(
    PROGRESSION_MIN,
    Math.min(currRepMax / prevRepMax, PROGRESSION_MAX),
  );
}
