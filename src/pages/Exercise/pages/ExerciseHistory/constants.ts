import type { ChartParameter } from "./types.ts";

export const CHART_PARAMETERS: ChartParameter[] = [
  { key: "oneRepMax", label: "1ПМ" },
  { key: "maxWeight", label: "МАКС ВЕС" },
  { key: "bestSetVolume", label: "ОБЪЁМ СЕТА" },
  { key: "workoutVolume", label: "ОБЪЁМ СЕССИИ" },
];

export const DATE_FORMATTER = new Intl.DateTimeFormat("ru", {
  day: "numeric",
  month: "short",
});
