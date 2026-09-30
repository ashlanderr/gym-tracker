import type { DataSummary } from "../../db";
import type { DangerAction } from "./types.ts";

export const PRIVACY_URL = "https://octus.fit/privacy/";
export const STRENGTH_LEVEL_URL =
  "https://strengthlevel.com/strength-standards";
export const EVERKINETIC_URL = "https://github.com/everkinetic/data";
export const CC_BY_SA_URL =
  "https://creativecommons.org/licenses/by-sa/4.0/deed.ru";

export const WORKOUT_FORMS: [string, string, string] = [
  "тренировка",
  "тренировки",
  "тренировок",
];

export const RECORD_FORMS: [string, string, string] = [
  "рекорд",
  "рекорда",
  "рекордов",
];

// What each action takes, row by row. Rows with nothing to delete are left
// out, so the list says only what will really go.
export const DANGER_ROWS: Record<
  DangerAction,
  { label: string; count: (summary: DataSummary) => number }[]
> = {
  records: [
    { label: "Рекорды", count: (d) => d.records },
    { label: "В упражнениях", count: (d) => d.recordExercises },
  ],
  history: [
    { label: "Тренировки", count: (d) => d.workouts },
    { label: "Подходы", count: (d) => d.sets },
    { label: "Рекорды", count: (d) => d.records },
  ],
  all: [
    { label: "Тренировки", count: (d) => d.workouts },
    { label: "Подходы", count: (d) => d.sets },
    { label: "Рекорды", count: (d) => d.records },
    { label: "Замеры веса и роста", count: (d) => d.measurements },
  ],
};

export const DANGER_TEXTS: Record<
  DangerAction,
  { title: string; keep: string; submit: string; waitSeconds?: number }
> = {
  records: {
    title: "Сбросить рекорды?",
    keep:
      "Тренировки и подходы останутся. Рекорды начнут считаться заново " +
      "со следующей тренировки.",
    submit: "Сбросить",
  },
  history: {
    title: "Удалить историю тренировок?",
    keep:
      "Профиль и замеры останутся. Уровень силы снова будет считаться " +
      "по анкете.",
    submit: "Удалить",
  },
  all: {
    title: "Удалить все данные?",
    keep:
      "Удалятся и профиль с ответами анкеты. Приложение станет как после " +
      "установки и начнётся с анкеты.",
    submit: "Удалить",
    waitSeconds: 5,
  },
};

// With an account, "all" reaches past the phone.
export const ACCOUNT_DELETE_KEEP =
  "Аккаунт удалится вместе с данными. Подписку RuStore это не отменит.";
