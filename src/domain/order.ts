import type { MuscleType, Performance, Set } from "../db";
import {
  computePerformanceStatus,
  type PerformanceStatus,
} from "./performances.ts";

// Locked is not kept anywhere either: an exercise waits for the unfinished
// ones above it that work the same muscles.
export type WorkoutStatus = PerformanceStatus | "locked";

export interface WorkoutStatuses {
  statuses: Map<string, WorkoutStatus>;
  // The earlier exercises an exercise waits for.
  blockers: Map<string, string[]>;
}

export function groupSets(sets: Set[]): Map<string, Set[]> {
  const result = new Map<string, Set[]>();
  for (const set of [...sets].sort((a, b) => a.order - b.order)) {
    result.set(set.performance, [...(result.get(set.performance) ?? []), set]);
  }
  return result;
}

// An exercise not started waits for the exercises above it that work any of
// its muscles and are not done yet: tired muscles would not match the last
// time. Exercises for other muscles stay open in parallel. The pending one
// counts as not done, to see what finishing it unlocked.
export function computeWorkoutStatuses(
  performances: Performance[],
  setsByPerformance: Map<string, Set[]>,
  muscles: Map<string, MuscleType[]>,
  pending?: string,
): WorkoutStatuses {
  const statuses = new Map<string, WorkoutStatus>();
  const blockers = new Map<string, string[]>();
  const unfinished: Performance[] = [];

  for (const performance of performances) {
    const own = muscles.get(performance.id) ?? [];
    const status =
      performance.id === pending
        ? "progress"
        : computePerformanceStatus(setsByPerformance.get(performance.id) ?? []);
    const waitsFor = unfinished
      .filter((p) => muscles.get(p.id)?.some((m) => own.includes(m)))
      .map((p) => p.id);

    blockers.set(performance.id, waitsFor);
    statuses.set(
      performance.id,
      status === "new" && waitsFor.length !== 0 ? "locked" : status,
    );
    if (status !== "done") unfinished.push(performance);
  }

  return { statuses, blockers };
}
