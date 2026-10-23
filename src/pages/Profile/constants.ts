import type { MeasurementType } from "../../db";
import type { MeasureSpec } from "./types.ts";

// In the order the tiles go. A girth is set to half a centimetre, the
// finest a tape is read to.
export const MEASURES: Record<MeasurementType, MeasureSpec> = {
  weight: {
    title: "Вес",
    units: "кг",
    decimals: 1,
    range: { min: 35, max: 180, step: 0.5, majorEvery: 10 },
    fallback: 80,
  },
  height: {
    title: "Рост",
    units: "см",
    decimals: 0,
    range: { min: 130, max: 220, step: 1, majorEvery: 10 },
    fallback: 178,
  },
  waist: {
    title: "Талия",
    units: "см",
    decimals: 1,
    range: { min: 50, max: 160, step: 0.5, majorEvery: 10 },
    fallback: 85,
  },
  chest: {
    title: "Грудь",
    units: "см",
    decimals: 1,
    range: { min: 60, max: 170, step: 0.5, majorEvery: 10 },
    fallback: 100,
  },
  hips: {
    title: "Бёдра",
    units: "см",
    decimals: 1,
    range: { min: 60, max: 170, step: 0.5, majorEvery: 10 },
    fallback: 100,
  },
  biceps: {
    title: "Бицепс",
    units: "см",
    decimals: 1,
    range: { min: 20, max: 60, step: 0.5, majorEvery: 10 },
    fallback: 35,
  },
};

export const MEASUREMENT_TYPES = Object.keys(MEASURES) as MeasurementType[];

// The card says how long ago in words for a week, and the date after that:
// "12 дней назад" is arithmetic the reader has to undo.
export const RECENT_DAYS = 7;

export const DAY_FORMS: [string, string, string] = ["день", "дня", "дней"];
