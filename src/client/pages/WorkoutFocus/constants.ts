import { atom } from "jotai";
import type { Effort } from "../../db";

// The profile has no sex yet, so the button uses the male form until it does.
export const DONE_LABEL = "Сделал";

// Performances without a configured timer still get a rest screen, because
// the question about the set lives there.
export const DEFAULT_REST_SECONDS = 120;

export const REST_ADJUST_SECONDS = 15;

// Manual step when the weight can't be assembled from the inventory.
export const MANUAL_WEIGHT_STEP = 2.5;

export const EFFORTS: Array<{ key: Effort; label: string }> = [
  { key: "easy", label: "Легко" },
  { key: "normal", label: "Норм" },
  { key: "hard", label: "Тяжело" },
  { key: "failure", label: "Отказ" },
];

export const HINTS = [
  "нажми на вес — покажу, какие блины вешать",
  "нажми на повторы — если получилось иначе",
  "нажми на название — техника, прогресс, замена",
];

// The set the rest screen asks about. Kept in memory like the timer itself.
export const LAST_COMPLETED_SET_ATOM = atom<string | null>(null);
