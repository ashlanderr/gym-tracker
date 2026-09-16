import type {
  CompletedSetData,
  DraftSetData,
  RecommendationParams,
  RecSetData,
} from "./types.ts";
import { WARM_UP_SETS } from "./constants.ts";
import { addSelfWeight, snapWeightKg, subtractSelfWeight } from "../weights";

// Working sets are not recommended until the new algorithm is written:
// only the target rep range is shown, and warm-ups follow the working weight.
export function buildRecommendations(
  params: RecommendationParams,
): RecSetData[] {
  const { currentSets, previousSets, reps } = params;

  const currWorkingSets = currentSets.filter((s) => s.type !== "warm-up");
  const prevWorkingSets = previousSets.filter((s) => s.type !== "warm-up");
  const warmUpCount = currentSets.length - currWorkingSets.length;
  let warmUpIndex = 0;

  return currentSets.map((set) => {
    if (set.type !== "warm-up") {
      return { type: set.type, weight: undefined, reps };
    }

    const warmUp = computeWarmUpSet(
      params,
      currWorkingSets.at(0),
      prevWorkingSets.at(0),
      warmUpCount,
      warmUpIndex,
    );
    warmUpIndex += 1;
    return warmUp;
  });
}

function computeWarmUpSet(
  params: RecommendationParams,
  currentWorking: DraftSetData | undefined,
  previousWorking: CompletedSetData | undefined,
  count: number,
  index: number,
): RecSetData {
  const { exercise, gym, selfWeight } = params;
  const workingWeight = currentWorking?.weight ?? previousWorking?.weight;
  const template = WARM_UP_SETS.at(count - 1)?.at(index);

  if (workingWeight === undefined || !template) {
    return { type: "warm-up", weight: undefined, reps: undefined };
  }

  const fullWeight = addSelfWeight(exercise.weight, selfWeight, workingWeight);
  const weight = subtractSelfWeight(
    exercise.weight,
    selfWeight,
    fullWeight * template.weight,
  );

  return {
    type: "warm-up",
    weight: snapWeightKg(exercise, gym, weight),
    reps: { min: template.reps, max: template.reps },
  };
}
