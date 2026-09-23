import type { DemoProfile } from "./types.ts";

export const LEVEL_LABELS = ["Новичок", "Средний", "Про", "Элита"];

// Thresholds are placeholders until the strength standards are chosen.
export const TRAINED: DemoProfile = {
  name: "Александр",
  summary: "Мужчина · 182 см · 82,5 кг",
  bodyWeight: 82.5,
  workouts: 11,
  lifts: [
    {
      anchor: "bench",
      exercise: "bench_press",
      source: "history",
      best: { weight: 80, reps: 7 },
      thresholds: [60, 100, 140],
    },
    {
      anchor: "squat",
      exercise: "back_squat",
      source: "history",
      best: { weight: 100, reps: 5 },
      thresholds: [80, 125, 175],
    },
    {
      anchor: "deadlift",
      exercise: "deadlift",
      source: "stale",
      best: null,
      thresholds: [100, 150, 205],
    },
    {
      anchor: "pullup",
      exercise: "pull_up_wide",
      source: "history",
      best: { weight: 20, reps: 5 },
      thresholds: [92.5, 112.5, 132.5],
    },
  ],
  muscles: {
    chest: 3,
    triceps: 2,
    shoulders: 2,
    lats: 3,
    upper_back: 3,
    biceps: 2,
    quadriceps: 2,
    glutes: 2,
    hamstrings: 1,
    abs: 1,
    forearms: 1,
  },
};

export const NEWCOMER: DemoProfile = {
  name: "Анонимный пользователь",
  summary: "Женщина · 165 см · 61 кг",
  bodyWeight: 61,
  workouts: 0,
  lifts: [
    {
      anchor: "bench",
      exercise: "bench_press",
      source: "survey",
      best: { weight: 20, reps: 10 },
      thresholds: [35, 60, 85],
    },
    {
      anchor: "squat",
      exercise: "back_squat",
      source: "survey",
      best: { weight: 30, reps: 8 },
      thresholds: [50, 85, 120],
    },
    {
      anchor: "deadlift",
      exercise: "deadlift",
      source: "survey",
      best: { weight: 40, reps: 8 },
      thresholds: [60, 100, 140],
    },
    {
      anchor: "pullup",
      exercise: "pull_up_wide",
      source: "survey",
      best: { weight: -20, reps: 5 },
      thresholds: [61, 71, 86],
    },
  ],
  muscles: {},
};
