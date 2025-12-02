import type { RecommendationParams, RecSetData } from "../types.ts";
import {
  NEXT_WEIGHT_PARAMS,
  PREV_WEIGHT_PARAMS,
  REP_RANGES,
  EPSILON_WEIGHT,
} from "./constants.ts";
import { DEFAULT_EXERCISE_REPS } from "../../../db";
import type { WeightUpdateParams } from "./types.ts";
import { snapWeightKg } from "../../weights";

export function buildRecommendations(
  params: RecommendationParams,
): RecSetData[] {
  const {
    currentSets,
    previousSets,
    exerciseReps,
    exerciseWeights,
    performanceWeights,
  } = params;

  if (!performanceWeights) return [];

  const repRange = REP_RANGES[exerciseReps ?? DEFAULT_EXERCISE_REPS];
  const previousWorking = previousSets.filter((s) => s.type !== "warm-up");
  const result: RecSetData[] = [];
  let workingIndex = 0;

  for (const set of currentSets) {
    switch (set.type) {
      case "warm-up": {
        result.push({
          type: "warm-up",
          weight: undefined,
          reps: undefined,
        });

        break;
      }

      default: {
        const previous = previousWorking.at(workingIndex);
        workingIndex += 1;

        let update: WeightUpdateParams = { direction: 0, rounding: "round" };

        if (previous && previous.reps >= repRange.max) {
          update = NEXT_WEIGHT_PARAMS[exerciseWeights?.type ?? "full"];
        } else if (previous && previous.reps < repRange.min) {
          update = PREV_WEIGHT_PARAMS[exerciseWeights?.type ?? "full"];
        }

        const { direction, rounding } = update;

        const newWeight =
          previous &&
          snapWeightKg(
            performanceWeights,
            previous.weight + EPSILON_WEIGHT * direction,
            rounding,
          );

        result.push({
          type: "working",
          weight: newWeight,
          reps: repRange,
        });
      }
    }
  }

  return result;
}
