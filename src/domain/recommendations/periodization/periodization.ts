import type { RecommendationParams, RecSetData } from "../types.ts";
import {
  addSelfWeight,
  oneRepMaxToReps,
  oneRepMaxToWeight,
  type RoundingMode,
  snapWeightKg,
  subtractSelfWeight,
  volumeToOneRepMax,
} from "../../weights";
import { MODE_PARAMS, WARM_UP_SETS } from "./constants.ts";
import {
  minBy,
  type PeriodizationData,
  type PeriodizationMode,
} from "../../../db";

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
    periodization,
    performanceWeights,
    exerciseWeights,
    selfWeight,
    exerciseReps,
  } = params;
  const fullRepMax = computeFullOneRepMax(params);

  if (
    periodization === undefined ||
    fullRepMax === undefined ||
    performanceWeights === undefined ||
    exerciseReps === undefined
  ) {
    return undefined;
  }

  const mode = getCurrentPeriodization(periodization);
  const { minReps, maxReps, defaultPercent, maxPercent } =
    MODE_PARAMS[exerciseReps][mode];

  const defaultFullWeight = fullRepMax * defaultPercent;
  const maxFullWeight = fullRepMax * maxPercent;
  const minRepMax = volumeToOneRepMax(defaultFullWeight, minReps);
  const maxRepMax = volumeToOneRepMax(defaultFullWeight, maxReps);
  const roundings: RoundingMode[] = ["floor", "ceil"];

  const options = roundings.map((rounding) => {
    const weight = snapWeightKg(
      performanceWeights,
      subtractSelfWeight(exerciseWeights, selfWeight, defaultFullWeight),
      rounding,
    );
    const fullWeight = addSelfWeight(exerciseWeights, selfWeight, weight);
    const delta = Math.abs(defaultFullWeight - fullWeight);
    return { weight, fullWeight, delta };
  });

  const option = minBy(
    options.filter((w) => w.fullWeight <= maxFullWeight),
    (a, b) => a.delta - b.delta,
  );
  if (!option) return undefined;

  const actualMinReps = Math.round(
    oneRepMaxToReps(minRepMax, option.fullWeight),
  );
  const actualMaxReps = Math.round(
    oneRepMaxToReps(maxRepMax, option.fullWeight),
  );

  return {
    type: "working",
    weight: option.weight,
    reps: { min: actualMinReps, max: actualMaxReps },
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
