import type { CompletedSet } from "../../db";
import type {
  FinishEvent,
  FinishInput,
  FinishSummary,
  NextTimeItem,
} from "./types.ts";

export function buildFinishSummary({
  performances,
  sets,
  records,
  exercises,
}: FinishInput): FinishSummary {
  const completed = sets.filter((s): s is CompletedSet => s.completed);
  const ordered = [...performances].sort((a, b) => a.order - b.order);

  const muscleWork = ordered.flatMap((performance) => {
    const exercise = exercises.get(performance.exercise);
    const done = completed.filter(
      (s) => s.performance === performance.id && s.type !== "warm-up",
    );
    return exercise ? [{ exercise, sets: done.length }] : [];
  });

  // One line per exercise: a better set, otherwise a heavier weight. Only
  // records that beat an earlier one count: the first time an exercise is
  // done everything is a "record", which says nothing.
  const events: FinishEvent[] = ordered.flatMap((performance) => {
    const exercise = exercises.get(performance.exercise);
    const beaten = records.filter(
      (r) =>
        r.performance === performance.id &&
        r.previous !== undefined &&
        r.previous !== null,
    );
    const record =
      beaten.find((r) => r.type === "one_rep_max") ??
      beaten.find((r) => r.type === "weight");
    const set = completed.find((s) => s.id === record?.set);

    if (!exercise || !record || !set) return [];

    return [
      {
        type: record.type === "one_rep_max" ? "best_set" : "max_weight",
        exercise,
        weight: set.weight,
        reps: set.reps,
      },
    ];
  });

  // A stub until recommendations exist: next time repeats today's weight.
  const nextTime: NextTimeItem[] = ordered.flatMap((performance) => {
    const exercise = exercises.get(performance.exercise);
    const weights = completed
      .filter((s) => s.performance === performance.id && s.type !== "warm-up")
      .map((s) => s.weight);
    return exercise && weights.length !== 0
      ? [{ exercise, weight: Math.max(...weights) }]
      : [];
  });

  return {
    completedSets: completed.length,
    skippedSets: sets.length - completed.length,
    volume: completed.reduce((sum, s) => sum + s.weight * s.reps, 0),
    muscleWork,
    events,
    nextTime,
  };
}

export function formatDurationWords(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const hours = Math.floor(minutes / 60);
  return hours ? `${hours} ч ${minutes % 60} мин` : `${minutes} мин`;
}
