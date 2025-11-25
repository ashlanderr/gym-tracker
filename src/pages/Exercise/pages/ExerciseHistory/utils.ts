import { type Performance, type Set } from "../../../../db";
import type { HistoryPoint } from "./types.ts";
import { volumeToOneRepMax } from "../../../../domain";

export function buildHistory(
  performances: Performance[],
  sets: Set[],
): HistoryPoint[] {
  const points = new Map<string, HistoryPoint>();

  const toDate = new Date();
  const fromDate = new Date(toDate);
  fromDate.setMonth(toDate.getMonth() - 12);

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
