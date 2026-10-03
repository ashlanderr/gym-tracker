import type { Effort, Exercise, Gym, RepRange } from "../../db";
import { stepWeightKg } from "../weights";
import { BELOW_FACTOR, EASY_FACTOR, LIGHT_MAX_ADD_KG } from "./constants.ts";
import { fromFullWeight, snapRecordedKg, toFullWeight } from "./full.ts";
import type { FindingReason } from "./types.ts";

const EPSILON = 1e-6;

// Where weight finding stands after the sets done so far. The weight is
// being found until a working set lands in the range rated "Норм" or
// "Тяжело", or falls below it, or is asked to go down; after that the last
// weight repeats.
export interface FindingState {
  isFinding: boolean;
  next: number | undefined;
  reason: FindingReason | undefined;
  // The last weight that did not fall below the range.
  lastGood: number | undefined;
}

export interface FindingContext {
  exercise: Exercise;
  gym: Gym;
  reps: RepRange;
  selfWeight: number | undefined;
}

export interface DoneSet {
  weight: number;
  reps: number;
  effort?: Effort;
}

export const INITIAL_FINDING: FindingState = {
  isFinding: true,
  next: undefined,
  reason: undefined,
  lastGood: undefined,
};

type Rating = "light" | "easy" | "keep" | "hold" | "below";

export function advanceFinding(
  state: FindingState,
  set: DoneSet,
  context: FindingContext,
): FindingState {
  if (!state.isFinding) {
    return { ...state, next: set.weight, reason: undefined };
  }

  const { exercise, selfWeight } = context;
  const full = toFullWeight(exercise, selfWeight, set.weight);

  switch (rate(set, context.reps)) {
    case "light":
      return raise(
        set.weight,
        Math.min(full * 2, full + LIGHT_MAX_ADD_KG),
        "light",
        context,
      );

    case "easy":
      return raise(set.weight, full * EASY_FACTOR, "easy", context);

    case "keep":
      return {
        ...state,
        next: set.weight,
        reason: undefined,
        lastGood: set.weight,
      };

    case "hold":
      return {
        ...state,
        isFinding: false,
        next: set.weight,
        reason: undefined,
      };

    case "below": {
      const lastGood =
        state.lastGood !== undefined
          ? toFullWeight(exercise, selfWeight, state.lastGood)
          : undefined;
      const target =
        lastGood !== undefined ? (full + lastGood) / 2 : full * BELOW_FACTOR;
      return {
        ...state,
        isFinding: false,
        next: snap(target, context),
        reason: "below",
      };
    }
  }
}

// Below the bottom of the range falls short whatever the rating. Without a
// rating nothing is known, so the weight stays and finding goes on.
function rate(set: DoneSet, { min }: RepRange): Rating {
  if (set.reps < min) return "below";

  switch (set.effort) {
    case "light":
      return "light";
    case "easy":
      return "easy";
    case "normal":
    case "hard":
      return "hold";
    case "failure":
      return "below";
    case undefined:
      return "keep";
  }
}

// A raise moves at least one step of the inventory; when even that is not
// possible, the equipment has nothing heavier.
function raise(
  weight: number,
  targetFull: number,
  reason: FindingReason,
  context: FindingContext,
): FindingState {
  const { exercise, gym, selfWeight } = context;
  const heavier = (a: number, b: number) =>
    toFullWeight(exercise, selfWeight, a) >
    toFullWeight(exercise, selfWeight, b) + EPSILON;

  let next = snap(targetFull, context);
  if (!heavier(next, weight)) {
    const direction = exercise.weight.type === "negative" ? -1 : 1;
    next = stepWeightKg(exercise, gym, weight, direction, 0);
  }

  return {
    isFinding: true,
    next,
    reason: heavier(next, weight) ? reason : "max",
    lastGood: weight,
  };
}

function snap(
  targetFull: number,
  { exercise, gym, selfWeight }: FindingContext,
): number {
  const recorded = fromFullWeight(exercise, selfWeight, targetFull);
  return snapRecordedKg(exercise, gym, recorded, "round");
}
