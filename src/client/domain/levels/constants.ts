import type { AnchorId, Sex } from "../../db";

export const ANCHOR_IDS: AnchorId[] = ["bench", "squat", "deadlift", "pullup"];

// The catalogue entry each anchor is measured by.
export const ANCHOR_EXERCISES: Record<AnchorId, string> = {
  bench: "bench_press",
  squat: "back_squat",
  deadlift: "deadlift",
  pullup: "pull_up_wide",
};

// The novice column of docs/recommendations/starting-weights.md, one-rep max
// in kg; pullups count the whole load.
export const NOVICE_ONE_REP_MAX: Record<AnchorId, Record<Sex, number>> = {
  bench: { male: 45, female: 22 },
  squat: { male: 60, female: 32 },
  deadlift: { male: 75, female: 40 },
  pullup: { male: 65, female: 42 },
};

// How far back the best set counts as today's strength.
export const STRENGTH_WINDOW_MS = 90 * 24 * 60 * 60 * 1000;
