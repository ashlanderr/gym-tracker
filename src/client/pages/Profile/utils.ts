import {
  type MeasurementType,
  type Profile,
  queryExerciseById,
  type Store,
} from "../../db";
import {
  ANCHOR_EXERCISES,
  ANCHOR_IDS,
  computeStrengthLevel,
  queryLiftStrength,
} from "../../domain";
import { pluralize } from "../../utils";
import { DAY_FORMS, MEASURES, RECENT_DAYS } from "./constants.ts";
import type { LiftRow } from "./types.ts";

export function buildLiftRows(
  store: Store,
  profile: Profile,
  bodyWeight: number,
  now: number,
): LiftRow[] {
  return ANCHOR_IDS.map((anchor) => {
    const { source, oneRepMax } = queryLiftStrength(
      store,
      profile,
      anchor,
      now,
    );
    const name =
      queryExerciseById(store, ANCHOR_EXERCISES[anchor])?.name ?? anchor;
    const level =
      oneRepMax === null
        ? null
        : computeStrengthLevel({
            anchor,
            sex: profile.sex,
            bodyWeight,
            oneRepMax,
          });
    return { anchor, name, source, oneRepMax, level };
  });
}

// Half a kilogram is as fine as a plate pair goes; the gap rounds up so it
// never reads zero while a level is still ahead.
export function formatKg(value: number, round: "nearest" | "up" = "nearest") {
  const halves = round === "up" ? Math.ceil(value * 2) : Math.round(value * 2);
  return `${(halves / 2).toLocaleString("ru")} кг`;
}

export function formatMeasure(value: number, type: MeasurementType): string {
  const { units, decimals } = MEASURES[type];
  return `${value.toLocaleString("ru", { maximumFractionDigits: decimals })} ${units}`;
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
