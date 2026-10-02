import { DEFAULT_WEIGHT_UNITS, type Exercise, type Gym } from "../../../../db";
import { TYPICAL_BARS, TYPICAL_PLATES } from "../constants.ts";
import type { InventoryDraft } from "./types.ts";

export function initialDraft(exercise: Exercise, gym: Gym): InventoryDraft {
  const units = gym.plates?.units ?? DEFAULT_WEIGHT_UNITS;

  return {
    plates: gym.plates ?? TYPICAL_PLATES[units],
    bars: gym.bars ?? TYPICAL_BARS[units],
    // Only the first dumbbell set is editable here, the model supports several.
    dumbbells: gym.dumbbells?.at(0) ?? { units: DEFAULT_WEIGHT_UNITS },
    stack: gym.stacks[exercise.id] ?? { units: DEFAULT_WEIGHT_UNITS },
  };
}

// The gym with the draft applied, or null while the draft is incomplete.
export function applyDraft(
  exercise: Exercise,
  gym: Gym,
  draft: InventoryDraft,
): Gym | null {
  const { plates, bars } = draft;

  switch (exercise.load.type) {
    case "none":
      return gym;

    case "barbell":
      return plates.items.length !== 0 && bars.items.length !== 0
        ? { ...gym, plates, bars }
        : null;

    case "plates":
      return plates.items.length !== 0 ? { ...gym, plates } : null;

    case "dumbbell": {
      const { units, min, max, step } = draft.dumbbells;
      if (min === undefined || max === undefined) return null;
      if (step === undefined || min > max) return null;
      const set = { units, min, max, step };
      return { ...gym, dumbbells: [set, ...(gym.dumbbells ?? []).slice(1)] };
    }

    case "stack": {
      const { units, base, step, max, additional } = draft.stack;
      if (base === undefined || step === undefined) return null;
      if (max === undefined || base > max) return null;
      const weights = { units, base, step, max, additional };
      return { ...gym, stacks: { ...gym.stacks, [exercise.id]: weights } };
    }
  }
}
