// The four lifts that stand for somebody's strength as a whole.
export type LiftId = "bench" | "squat" | "deadlift" | "pullup";

export const LIFT_IDS: LiftId[] = ["bench", "squat", "deadlift", "pullup"];

// The catalogue entry each lift is measured by.
export const LIFT_EXERCISES: Record<LiftId, string> = {
  bench: "bench_press",
  squat: "back_squat",
  deadlift: "deadlift",
  pullup: "pull_up_wide",
};

// How far back the best set counts as today's strength.
export const STRENGTH_WINDOW_MS = 90 * 24 * 60 * 60 * 1000;
