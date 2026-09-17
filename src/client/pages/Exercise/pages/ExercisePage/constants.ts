import type { ChartMetric, ChartPeriod, ExerciseTab } from "./types.ts";

export const TABS: Array<{ key: ExerciseTab; label: string }> = [
  { key: "technique", label: "Техника" },
  { key: "progress", label: "Прогресс" },
  { key: "history", label: "История" },
];

export const CHART_METRICS: Array<{ key: ChartMetric; label: string }> = [
  { key: "averageRepMax", label: "Сила за тренировку" },
  { key: "bestRepMax", label: "Лучший подход" },
  { key: "maxWeight", label: "Макс" },
];

export const CHART_PERIODS: Array<{ key: ChartPeriod; label: string }> = [
  { key: "three_months", label: "3 мес" },
  { key: "one_year", label: "1 год" },
  { key: "all", label: "всё" },
];

export const PERIOD_MONTHS: Record<ChartPeriod, number> = {
  three_months: 3,
  one_year: 12,
  all: Infinity,
};

export const AXIS_DATE_FORMATTER = new Intl.DateTimeFormat("ru", {
  day: "numeric",
  month: "short",
});

export const SESSION_DATE_FORMATTER = new Intl.DateTimeFormat("ru", {
  day: "numeric",
  month: "long",
});
