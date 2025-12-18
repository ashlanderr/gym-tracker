import type {
  DraftSetData,
  RecommendationParams,
  RecSetData,
} from "../types.ts";
import { WARM_UP_SETS } from "./constants.ts";
import { addSelfWeight, snapWeightKg, subtractSelfWeight } from "../../weights";

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
        workingIndex += 1;
        result.push({
          type: "working",
          weight: undefined,
          reps: undefined,
        });
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
