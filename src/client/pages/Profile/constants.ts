import type { MeasurementType } from "../../db";
import {
  DEFAULT_HEIGHT_CM,
  DEFAULT_WEIGHT_KG,
  HEIGHT_RANGE,
  WEIGHT_RANGE,
} from "../Onboarding/constants.ts";
import type { MeasureSpec } from "./types.ts";

export const ANONYMOUS_NAME = "Анонимный пользователь";

export const LEVEL_LABELS = ["Новичок", "Средний", "Про", "Элита"];

export const WORKOUT_FORMS: [string, string, string] = [
  "тренировка",
  "тренировки",
  "тренировок",
];

// The two measurements share one card, one sheet and one history page; this
// is all that tells them apart.
export const MEASURES: Record<MeasurementType, MeasureSpec> = {
  weight: {
    title: "Вес",
    units: "кг",
    decimals: 1,
    range: WEIGHT_RANGE,
    fallback: DEFAULT_WEIGHT_KG,
    addLabel: "Записать вес",
  },
  height: {
    title: "Рост",
    units: "см",
    decimals: 0,
    range: HEIGHT_RANGE,
    fallback: DEFAULT_HEIGHT_CM,
    addLabel: "Записать рост",
  },
};

// The card says how long ago in words for a week, and the date after that:
// "12 дней назад" is arithmetic the reader has to undo.
export const RECENT_DAYS = 7;

export const DAY_FORMS: [string, string, string] = ["день", "дня", "дней"];
