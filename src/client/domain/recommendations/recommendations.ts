import {
  advanceFinding,
  type FindingState,
  INITIAL_FINDING,
} from "./finding.ts";
import { startWeightKg } from "./start.ts";
import { planWarmUps } from "./warm-up.ts";
import type { RecommendationParams, RecSetData } from "./types.ts";

// The first weight of an exercise without history is the start weight; while
// the weight is being found it follows the ratings from set to set; after
// that the last weight repeats. A weight entered on a set not done yet is
// the plan, so the sets after it repeat it until it is done.
// TODO: progression. Steps forward and back, decay after a break and a
// stopped exercise are described in docs/recommendations/README.md but not
// settled yet.
export function buildRecommendations(
  params: RecommendationParams,
): RecSetData[] {
  const { currentSets, previousSets, exercise, gym, reps } = params;
  const context = { exercise, gym, reps, selfWeight: params.selfWeight };
  const canFind = exercise.load.type !== "none";
  const start = startWeightKg(exercise, gym, params.sex);

  let state: FindingState = INITIAL_FINDING;
  for (const set of previousSets) {
    if (set.type === "working") state = advanceFinding(state, set, context);
  }

  let isReasonShown = false;
  let entered: number | undefined;
  const working = currentSets.map((set): RecSetData | null => {
    if (set.type === "warm-up") return null;

    const recommendation: RecSetData = {
      type: set.type,
      weight: entered ?? state.next ?? start,
      reps,
      isFinding: canFind && state.isFinding,
      reason: !set.completed && !isReasonShown ? state.reason : undefined,
    };

    if (!set.completed) isReasonShown = true;

    if (!set.completed && set.weight !== undefined) entered = set.weight;

    if (set.completed && set.weight !== undefined && set.reps !== undefined) {
      entered = undefined;
      state = advanceFinding(
        state,
        { weight: set.weight, reps: set.reps, effort: set.effort },
        context,
      );
    }

    return recommendation;
  });

  const firstWorking = currentSets.findIndex((s) => s.type !== "warm-up");
  const workingWeight =
    firstWorking < 0
      ? undefined
      : (currentSets[firstWorking].weight ?? working[firstWorking]?.weight);
  const warmUps =
    workingWeight === undefined
      ? []
      : planWarmUps({
          exercise,
          gym,
          selfWeight: params.selfWeight,
          workingWeight,
          isFirstOfMovement: params.isFirstOfMovement,
        });

  let warmUpIndex = 0;
  return currentSets.map((_, index) => {
    const recommendation = working[index];
    if (recommendation) return recommendation;

    const warmUp = warmUps.at(warmUpIndex);
    warmUpIndex += 1;
    return {
      type: "warm-up",
      weight: warmUp?.weight,
      reps: warmUp?.reps,
      isFinding: false,
    };
  });
}
