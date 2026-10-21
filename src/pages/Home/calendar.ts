import type { Workout } from "../../db";
import { DAY_FORMATTER, MONTH_FORMATTER } from "./constants.ts";
import type { DayMark, PlannedWorkout } from "./types.ts";

// A day in local time as "2026-10-21": a workout belongs to the day it was
// started on where the phone is.
export function dayKey(date: Date | number): string {
  const d = new Date(date);
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}

export function parseDayKey(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

export function startOfWeek(date: Date): Date {
  const fromMonday = (date.getDay() + 6) % 7;
  return addDays(date, -fromMonday);
}

// Whole weeks from Monday to Sunday that cover both days.
export function buildWeeks(from: Date, to: Date): Date[][] {
  const weeks: Date[][] = [];
  const last = dayKey(to);

  for (let monday = startOfWeek(from); ; monday = addDays(monday, 7)) {
    const week = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
    weeks.push(week);
    if (week.some((d) => dayKey(d) === last)) return weeks;
  }
}

export function buildMonth(year: number, month: number): Date[][] {
  return buildWeeks(new Date(year, month, 1), new Date(year, month + 1, 0));
}

export function findWeek(weeks: Date[][], key: string): number {
  return weeks.findIndex((week) => week.some((d) => dayKey(d) === key));
}

// The year is said only when it is not this one.
export function formatMonth(date: Date, today: Date): string {
  const month = capitalize(MONTH_FORMATTER.format(date));
  return date.getFullYear() === today.getFullYear()
    ? month
    : `${month} ${date.getFullYear()}`;
}

export function formatDay(date: Date, today: Date): string {
  const days = Math.round((date.getTime() - today.getTime()) / 86400_000);
  if (days === 0) return "Сегодня";
  if (days === -1) return "Вчера";
  if (days === 1) return "Завтра";
  return capitalize(DAY_FORMATTER.format(date));
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// An active workout outshines a finished one on the same day, and both
// outshine a plan. A missed plan leaves no mark.
export function buildDayMarks(
  workouts: Workout[],
  plan: Map<string, PlannedWorkout[]> = new Map(),
): Map<string, DayMark> {
  const marks = new Map<string, DayMark>();

  for (const [key, planned] of plan) {
    if (planned.some((p) => !p.missed)) marks.set(key, "planned");
  }

  for (const workout of workouts) {
    const key = dayKey(workout.startedAt);
    if (workout.completedAt === null) marks.set(key, "active");
    else if (marks.get(key) !== "active") marks.set(key, "done");
  }

  return marks;
}
