import type { MeasurementType } from "../../db";
import type { MeasureSpec } from "./types.ts";

export const MEASURES: Record<MeasurementType, MeasureSpec> = {
  weight: { title: "Вес", units: "кг", decimals: 1 },
  height: { title: "Рост", units: "см", decimals: 0 },
  waist: { title: "Талия", units: "см", decimals: 1 },
  chest: { title: "Грудь", units: "см", decimals: 1 },
  hips: { title: "Бёдра", units: "см", decimals: 1 },
  biceps: { title: "Бицепс", units: "см", decimals: 1 },
};

// The card says how long ago in words for a week, and the date after that:
// "12 дней назад" is arithmetic the reader has to undo.
export const RECENT_DAYS = 7;

export const DAY_FORMS: [string, string, string] = ["день", "дня", "дней"];
