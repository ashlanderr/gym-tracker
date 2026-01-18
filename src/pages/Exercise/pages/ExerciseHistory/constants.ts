import type { ChartParameter, ChartPeriod } from "./types.ts";

export const CHART_PARAMETERS: ChartParameter[] = [
  { key: "oneRepMax", label: "1ПМ" },
  { key: "maxWeight", label: "МАКС ВЕС" },
  { key: "bestSetVolume", label: "ОБЪЁМ СЕТА" },
  { key: "workoutVolume", label: "ОБЪЁМ СЕССИИ" },
];

export const CHART_PERIODS: ChartPeriod[] = [
  { key: "three_months", label: "3 МЕС" },
  { key: "one_year", label: "1 ГОД" },
  { key: "all", label: "ВСЕ" },
];

export const DATE_FORMATTER = new Intl.DateTimeFormat("ru", {
  day: "numeric",
  month: "short",
});
