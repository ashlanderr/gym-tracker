import type {
  DraftSetData,
  RecommendationParams,
  RecSetData,
} from "./types.ts";
import { WARM_UP_SETS } from "./constants.ts";
import { computeRepRange, computeWorkingWeight } from "./working.ts";
import { addSelfWeight, snapWeightKg, subtractSelfWeight } from "../weights";

// What empty sets suggest: the plan of the exercise. The first working set
// gets the working weight of the last time, raised or rolled back. Every next
// one repeats the weight of the working set above it, entered or done, also
// after a short set: a rollback waits for the next time. The reps of a
// working set are the range for its weight.
export function buildRecommendations(
  params: RecommendationParams,
): RecSetData[] {
  const { currentSets, previousSets, exerciseReps } = params;

  const currWorkingSets = currentSets.filter((s) => s.type !== "warm-up");
  const prevWorkingSets = previousSets.filter((s) => s.type !== "warm-up");
  const warmUpCount = currentSets.length - currWorkingSets.length;
  let weight = computeWorkingWeight(previousSets, exerciseReps, params);
  let warmUpIndex = 0;
  let workingIndex = 0;

  return currentSets.map((set): RecSetData => {
    if (set.type === "warm-up") {
      const warmUp = computeWarmUpSet(
        params,
        currWorkingSets[workingIndex],
        prevWorkingSets[workingIndex],
        warmUpCount,
        warmUpIndex,
      );
      warmUpIndex += 1;
      return warmUp;
    }

    const working: RecSetData = {
      type: set.type,
      weight,
      reps: computeRepRange(set.weight ?? weight, exerciseReps, params),
    };
    if (set.weight !== undefined) weight = set.weight;
    workingIndex += 1;
    return working;
  });
}

function computeWarmUpSet(
  params: RecommendationParams,
  currentWorking: DraftSetData | undefined,
  previousWorking: DraftSetData | undefined,
  count: number,
  index: number,
): RecSetData {
  const working =
    currentWorking?.weight !== undefined ? currentWorking : previousWorking;
  const template = WARM_UP_SETS.at(count - 1)?.at(index);

  if (!working?.weight || !template) {
    return { type: "warm-up", weight: undefined, reps: undefined };
  }

  const { exerciseWeights, selfWeight, performanceWeights } = params;
  const warmUpMax = addSelfWeight(exerciseWeights, selfWeight, working.weight);
  const weight = subtractSelfWeight(
    exerciseWeights,
    selfWeight,
    warmUpMax * template.weight,
  );

  return {
    type: "warm-up",
    weight: snapWeightKg(performanceWeights, weight),
    reps: { min: template.reps, max: template.reps },
  };
}
