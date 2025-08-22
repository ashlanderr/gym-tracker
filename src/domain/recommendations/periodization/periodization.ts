import type {
  Periodization,
  RecommendationParams,
  RecSetData,
} from "../types.ts";
import {
  addSelfWeight,
  oneRepMaxToReps,
  oneRepMaxToWeight,
  type RoundingMode,
  snapWeightKg,
  subtractSelfWeight,
  volumeToOneRepMax,
} from "../../weights";
import type { PeriodizationMode } from "../types.ts";
import { assertNever } from "../../../utils";
import { WARM_UP_SETS } from "./constants.ts";

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

export function selectMode(periodization: Periodization): PeriodizationMode {
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

function computeWorkingSet(
  params: RecommendationParams,
): RecSetData | undefined {
  const {
    periodization,
    oneRepMax,
    performanceWeights,
    exerciseWeights,
    selfWeight,
  } = params;
  if (periodization === undefined || oneRepMax === undefined) return undefined;

  const defaultReps = 6;
  const fullRepMax = volumeToOneRepMax(
    addSelfWeight(
      exerciseWeights,
      selfWeight,
      oneRepMaxToWeight(oneRepMax, defaultReps),
    ),
    defaultReps,
  );

  const mode = selectMode(periodization);
  let minReps: number;
  let maxReps: number;
  let fullWeight: number;
  let rounding: RoundingMode;

  switch (mode) {
    case "light":
      minReps = 10;
      maxReps = 12;
      fullWeight = fullRepMax * 0.65;
      rounding = "floor";
      break;

    case "medium":
      minReps = 6;
      maxReps = 8;
      fullWeight = fullRepMax * 0.75;
      rounding = "floor";
      break;

    case "heavy":
      minReps = 4;
      maxReps = 6;
      fullWeight = fullRepMax * 0.85;
      rounding = "floor";
      break;

    default:
      assertNever(mode);
  }

  const minRepMax = volumeToOneRepMax(fullWeight, minReps);
  const maxRepMax = volumeToOneRepMax(fullWeight, maxReps);
  const weight = snapWeightKg(
    performanceWeights,
    subtractSelfWeight(exerciseWeights, selfWeight, fullWeight),
    rounding,
  );

  fullWeight = addSelfWeight(exerciseWeights, selfWeight, weight);
  minReps = Math.round(oneRepMaxToReps(minRepMax, fullWeight));
  maxReps = Math.round(oneRepMaxToReps(maxRepMax, fullWeight));

  return { type: "working", weight, reps: { min: minReps, max: maxReps } };
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
