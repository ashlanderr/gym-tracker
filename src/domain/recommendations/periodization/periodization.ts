import type { RecommendationParams, RecSetData } from "../types.ts";
import {
  addSelfWeight,
  oneRepMaxToWeight,
  snapWeightKg,
  subtractSelfWeight,
  volumeToOneRepMax,
} from "../../weights";
import {
  EPSILON_WEIGHT,
  MODE_PARAMS,
  NEXT_WEIGHT_PARAMS,
  PREV_WEIGHT_PARAMS,
  WARM_UP_SETS,
} from "./constants.ts";
import { type PeriodizationData, type PeriodizationMode } from "../../../db";
import type { WeightUpdateParams } from "./types.ts";

export function buildRecommendations(
  params: RecommendationParams,
): RecSetData[] {
  const working = computeWorkingSet(params);
  if (!working) return [];

  const { currentSets } = params;
  const warmUpSets = currentSets.filter((s) => s.type === "warm-up");
  const result: RecSetData[] = [];
  let warmUpIndex = 0;

  for (const set of currentSets) {
    switch (set.type) {
      case "warm-up": {
        const warmUp = computeWarmUpSet(
          params,
          working,
          warmUpSets.length,
          warmUpIndex,
        );
        result.push(warmUp);
        warmUpIndex += 1;
        break;
      }

      default: {
        result.push(working);
        break;
      }
    }
  }

  return result;
}

export function getCurrentPeriodization(
  periodization: PeriodizationData,
): PeriodizationMode {
  const { light, medium, heavy, counter } = periodization;
  const total = heavy + medium + light;
  const index = counter % total;

  if (index < light) {
    return "light";
  } else if (index < light + medium) {
    return "medium";
  } else {
    return "heavy";
  }
}

export function buildPeriodization(mode: PeriodizationMode): PeriodizationData {
  switch (mode) {
    case "light":
      return { counter: 0, light: 1, medium: 0, heavy: 0 };
    case "medium":
      return { counter: 0, light: 0, medium: 1, heavy: 0 };
    case "heavy":
      return { counter: 0, light: 0, medium: 0, heavy: 1 };
  }
}

function computeFullOneRepMax(
  params: RecommendationParams,
): number | undefined {
  const { oneRepMax, selfWeight, exerciseWeights } = params;

  if (oneRepMax === undefined) {
    return undefined;
  }

  if (oneRepMax.full !== undefined) {
    return oneRepMax.full;
  }

  const defaultReps = 6;
  return volumeToOneRepMax(
    addSelfWeight(
      exerciseWeights,
      selfWeight,
      oneRepMaxToWeight(oneRepMax.current, defaultReps),
    ),
    defaultReps,
  );
}

function computeWorkingSet(
  params: RecommendationParams,
): RecSetData | undefined {
  const {
    previousSets,
    exerciseReps,
    periodization,
    performanceWeights,
    exerciseWeights,
    selfWeight,
  } = params;

  const fullRepMax = computeFullOneRepMax(params);

  if (
    exerciseReps === undefined ||
    periodization === undefined ||
    performanceWeights === undefined
  ) {
    return undefined;
  }

  const periodizationMode = getCurrentPeriodization(periodization);
  const { minReps, maxReps, reserve } =
    MODE_PARAMS[exerciseReps][periodizationMode];

  const workingSets = previousSets.filter((s) => s.type !== "warm-up");
  const availableReserve = Math.min(reserve, workingSets.length);
  const maxFails = workingSets.length - availableReserve;

  if (workingSets.length === 0) {
    const fullWeight =
      fullRepMax && oneRepMaxToWeight(fullRepMax, maxReps + reserve);
    const { rounding } = PREV_WEIGHT_PARAMS[exerciseWeights?.type ?? "full"];
    const weight =
      fullWeight &&
      snapWeightKg(
        performanceWeights,
        subtractSelfWeight(exerciseWeights, selfWeight, fullWeight),
        rounding,
      );
    return {
      type: "working",
      weight: weight || undefined,
      reps: { min: minReps, max: maxReps },
    };
  }

  const maxWeight = Math.max(...workingSets.map((s) => s.weight));
  const maxedOutSets = workingSets.filter(
    (s) => s.weight >= maxWeight && s.reps >= maxReps,
  );
  const failedSets = workingSets.filter(
    (s) => s.weight < maxWeight || s.reps < minReps,
  );

  let update: WeightUpdateParams = { direction: 0, rounding: "round" };

  if (maxedOutSets.length >= availableReserve) {
    update = NEXT_WEIGHT_PARAMS[exerciseWeights?.type ?? "full"];
  } else if (failedSets.length > maxFails) {
    update = PREV_WEIGHT_PARAMS[exerciseWeights?.type ?? "full"];
  }

  const { direction, rounding } = update;

  const newWeight = snapWeightKg(
    performanceWeights,
    maxWeight + EPSILON_WEIGHT * direction,
    rounding,
  );

  return {
    type: "working",
    reps: { min: minReps, max: maxReps },
    weight: newWeight,
  };
}

function computeWarmUpSet(
  params: RecommendationParams,
  working: RecSetData,
  count: number,
  index: number,
): RecSetData {
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

export function computeNextPeriodization(
  periodization: PeriodizationData,
): PeriodizationData {
  return { ...periodization, counter: periodization.counter + 1 };
}
