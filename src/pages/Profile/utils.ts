import type { Measurement, MeasurementType } from "../../db";
import { formatNumber, pluralize } from "../../utils";
import {
  DAY_FORMS,
  MEASURES,
  MEASUREMENT_TYPES,
  RECENT_DAYS,
} from "./constants.ts";

// Keeps the order it is given: newest first in, newest first out.
export function groupByType(
  measurements: Measurement[],
): Record<MeasurementType, Measurement[]> {
  const groups = Object.fromEntries(
    MEASUREMENT_TYPES.map((type) => [type, [] as Measurement[]]),
  ) as Record<MeasurementType, Measurement[]>;
  for (const measurement of measurements) {
    groups[measurement.type]?.push(measurement);
  }
  return groups;
}

export function toPoints(measurements: Measurement[]) {
  return measurements.map((m) => ({ x: m.createdAt, y: m.value })).reverse();
}

export function formatMeasure(value: number, type: MeasurementType): string {
  const { units, decimals } = MEASURES[type];
  return `${formatNumber(value, { maximumFractionDigits: decimals })} ${units}`;
}

// Neither direction is good or bad: we do not know whether somebody is
// losing weight or gaining it, so a change is only ever a signed number.
export function formatChange(change: number, type: MeasurementType): string {
  const sign = change > 0 ? "+" : change < 0 ? "−" : "";
  return `${sign}${formatMeasure(Math.abs(change), type)}`;
}

export function formatDay(date: number, now: number): string {
  const sameYear = new Date(date).getFullYear() === new Date(now).getFullYear();
  return new Date(date).toLocaleDateString("ru", {
    day: "numeric",
    month: "long",
    ...(sameYear ? {} : { year: "numeric" }),
  });
}

// Counted in calendar days: a weigh-in late last night was "вчера" this
// morning, however few hours ago it was.
export function formatAgo(date: number, now: number): string {
  const days = Math.round((startOfDay(now) - startOfDay(date)) / DAY_MS);
  if (days <= 0) return "сегодня";
  if (days === 1) return "вчера";
  if (days < RECENT_DAYS) return `${pluralize(days, DAY_FORMS)} назад`;
  return formatDay(date, now);
}

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(date: number): number {
  const day = new Date(date);
  day.setHours(0, 0, 0, 0);
  return day.getTime();
}
