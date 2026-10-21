import type { Workout, WorkoutRepeat } from "../../db";
import { dayKey, parseDayKey } from "./calendar.ts";
import { REPEAT_DAYS, WEEKDAYS_PLURAL } from "./constants.ts";
import type { PlannedWorkout } from "./types.ts";

// Days as whole numbers, so a shift of the clocks never moves them.
function dayNumber(key: string): number {
  const [year, month, day] = key.split("-").map(Number);
  return Date.UTC(year, month - 1, day) / 86400_000;
}

function fromDayNumber(number: number): string {
  const date = new Date(number * 86400_000);
  return dayKey(
    new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

// The days a repeating workout is due between two days. A chain of repeats
// is planned only after its latest one: what came before is history, and a
// due day that passed without the workout is missed.
export function buildPlan(
  workouts: Workout[],
  from: string,
  to: string,
  today: string,
): Map<string, PlannedWorkout[]> {
  const latest = new Map<string, Workout>();
  for (const workout of workouts) {
    const id = workout.repeat?.id;
    if (!id) continue;
    const other = latest.get(id);
    if (!other || other.startedAt < workout.startedAt) latest.set(id, workout);
  }

  const plan = new Map<string, PlannedWorkout[]>();

  for (const template of latest.values()) {
    const rule = template.repeat!;
    if (rule.days < 1) continue;

    const anchor = dayNumber(rule.from);
    const start = Math.max(
      dayNumber(from),
      anchor,
      dayNumber(dayKey(template.startedAt)) + 1,
    );
    const end = dayNumber(to);
    const first = anchor + Math.ceil((start - anchor) / rule.days) * rule.days;

    for (let day = first; day <= end; day += rule.days) {
      const key = fromDayNumber(day);
      const planned = { template, missed: key < today };
      plan.set(key, [...(plan.get(key) ?? []), planned]);
    }
  }

  return plan;
}

export function nextDue(rule: Omit<WorkoutRepeat, "id">, today: string) {
  const anchor = dayNumber(rule.from);
  const start = Math.max(dayNumber(today), anchor);
  return parseDayKey(
    fromDayNumber(anchor + Math.ceil((start - anchor) / rule.days) * rule.days),
  );
}

export function formatRepeat(rule: Omit<WorkoutRepeat, "id">): string {
  if (rule.days === 7) return WEEKDAYS_PLURAL[parseDayKey(rule.from).getDay()];
  return `каждые ${rule.days} ${pluralize(rule.days, REPEAT_DAYS)}`;
}

function pluralize(count: number, forms: [string, string, string]): string {
  const tens = count % 100;
  const ones = count % 10;
  if (tens > 10 && tens < 20) return forms[2];
  if (ones === 1) return forms[0];
  if (ones > 1 && ones < 5) return forms[1];
  return forms[2];
}
