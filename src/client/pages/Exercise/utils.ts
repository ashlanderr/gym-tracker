import type { CompletedSet, Performance, Set } from "../../db";
import { volumeToOneRepMax } from "../../domain";
import type { ChartPeriod, HistoryPoint, HistorySession } from "./types.ts";
import { PERIOD_MONTHS } from "./constants.ts";

// Every performance with completed sets, newest first.
export function buildSessions(
  performances: Performance[],
  sets: Set[],
): HistorySession[] {
  return performances
    .map((performance) => ({
      performance,
      sets: sets
        .filter((s): s is CompletedSet => s.completed)
        .filter((s) => s.performance === performance.id)
        .sort((a, b) => a.order - b.order),
    }))
    .filter((session) => session.sets.length !== 0)
    .sort((a, b) => b.performance.startedAt - a.performance.startedAt);
}

// One point per workout from its working sets. Weights go through
// fullWeight, so body weight exercises count the body too.
export function buildHistory(
  sessions: HistorySession[],
  period: ChartPeriod,
  fullWeight: (weight: number) => number,
  now: number,
): HistoryPoint[] {
  const from = new Date(now);
  from.setMonth(from.getMonth() - PERIOD_MONTHS[period]);
  const fromTime = Number.isNaN(from.valueOf()) ? -Infinity : from.valueOf();

  const byWorkout = new Map<string, { date: number; sets: CompletedSet[] }>();

  for (const { performance, sets } of sessions) {
    if (performance.startedAt < fromTime) continue;

    const working = sets.filter((s) => s.type !== "warm-up");
    if (working.length === 0) continue;

    const entry = byWorkout.get(performance.workout) ?? {
      date: performance.startedAt,
      sets: [],
    };
    entry.sets.push(...working);
    byWorkout.set(performance.workout, entry);
  }

  return [...byWorkout.values()]
    .map(({ date, sets }) => {
      const repMaxes = sets.map((s) =>
        volumeToOneRepMax(fullWeight(s.weight), s.reps),
      );
      return {
        date,
        averageRepMax: round(
          repMaxes.reduce((a, b) => a + b, 0) / repMaxes.length,
        ),
        bestRepMax: round(Math.max(...repMaxes)),
        maxWeight: round(Math.max(...sets.map((s) => fullWeight(s.weight)))),
      };
    })
    .sort((a, b) => a.date - b.date);
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}
