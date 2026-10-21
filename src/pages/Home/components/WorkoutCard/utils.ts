import type { Performance, Set } from "../../../../db";
import type { ExerciseSummary } from "./types.ts";

// One line per exercise in the order of the workout: how many sets are done
// of how many, and the heaviest of them, by reps when the weight is the same.
export function summarizeExercises(
  performances: Performance[],
  sets: Set[],
): ExerciseSummary[] {
  return performances.map((performance) => {
    const own = sets.filter((s) => s.performance === performance.id);
    const done = own.filter((s) => s.completed);
    const best = done.reduce<Set | null>(
      (best, set) =>
        !best ||
        set.weight! > best.weight! ||
        (set.weight === best.weight && set.reps! > best.reps!)
          ? set
          : best,
      null,
    );

    return {
      performance: performance.id,
      exercise: performance.exercise,
      done: done.length,
      total: own.length,
      best: best && { weight: best.weight!, reps: best.reps! },
    };
  });
}

// "1 ч 05 мин" for a finished workout.
export function formatDuration(milliseconds: number): string {
  const minutes = Math.max(0, Math.round(milliseconds / 60_000));
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  return hours
    ? `${hours} ч ${rest.toString().padStart(2, "0")} мин`
    : `${rest} мин`;
}
