import { type Performance, type Set } from "../../../../db";
import type { ChartPeriodType, HistoryPoint } from "./types.ts";
import { volumeToOneRepMax } from "../../../../domain";
import { assertNever } from "../../../../utils";

export function buildHistory(
  performances: Performance[],
  sets: Set[],
  period: ChartPeriodType,
): HistoryPoint[] {
  const points = new Map<string, HistoryPoint>();

  const toDate = new Date();
  const fromDate = new Date(toDate);

  switch (period) {
    case "three_months":
      fromDate.setMonth(toDate.getMonth() - 3);
      break;

    case "one_year":
      fromDate.setMonth(toDate.getMonth() - 12);
      break;

    case "all":
      fromDate.setTime(0);
      break;

    default:
      assertNever(period);
  }

  for (const set of sets) {
    if (!set.completed) continue;

    const performance = performances.find((p) => p.id === set.performance);
    if (!performance) continue;

    if (performance.startedAt < fromDate.valueOf()) {
      continue;
    }

    let point = points.get(performance.workout);
    if (!point) {
      point = {
        date: new Date(performance.startedAt),
        maxWeight: 0,
        oneRepMax: 0,
        bestSetVolume: 0,
        workoutVolume: 0,
        periodization: performance.periodization,
      };
      points.set(performance.workout, point);
    }

    const weight = set.weight;
    const oneRepMax = volumeToOneRepMax(weight, set.reps);
    const setVolume = weight * set.reps;

    point.maxWeight = Math.max(point.maxWeight, weight);
    point.oneRepMax = Math.max(point.oneRepMax, oneRepMax);
    point.bestSetVolume = Math.max(point.bestSetVolume, setVolume);
    point.workoutVolume += setVolume;
  }

  return [...points.values()].sort(
    (a, b) => a.date.valueOf() - b.date.valueOf(),
  );
}
