import {
  type CompletedSet,
  type Exercise,
  queryExerciseById,
  queryLatestMeasurement,
  queryPerformancesByExercise,
  querySetsByPerformance,
  type Store,
} from "../../db";
import { addSelfWeight, volumeToOneRepMax } from "../weights";
import {
  LIFT_EXERCISES,
  type LiftId,
  STRENGTH_WINDOW_MS,
} from "./constants.ts";

// Where today's one-rep max of a lift comes from: the best set of the
// window, or nothing, because the lift was done too long ago to say anything
// or was never done at all.
export type LiftSource = "history" | "stale" | "none";

export type LiftStrength =
  | { lift: LiftId; source: "history"; oneRepMax: number }
  | { lift: LiftId; source: "stale" | "none"; oneRepMax: null };

export function queryLiftStrength(
  store: Store,
  lift: LiftId,
  now: number,
): LiftStrength {
  const exercise = queryExerciseById(store, LIFT_EXERCISES[lift]);
  if (!exercise) throw new Error(`No exercise for the ${lift} lift`);

  // TODO: count the neighbouring lifts of the same movement too, converted
  // by their strength factor, not the lift exercise alone.
  const done = queryPerformancesByExercise(store, exercise.id).flatMap(
    (performance) => {
      const best = bestOneRepMax(
        store,
        exercise,
        performance.id,
        performance.startedAt,
      );
      return best === null ? [] : [{ startedAt: performance.startedAt, best }];
    },
  );

  if (done.length === 0) return { lift, source: "none", oneRepMax: null };

  const recent = done.filter((d) => d.startedAt >= now - STRENGTH_WINDOW_MS);
  return recent.length === 0
    ? { lift, source: "stale", oneRepMax: null }
    : {
        lift,
        source: "history",
        oneRepMax: Math.max(...recent.map((d) => d.best)),
      };
}

function bestOneRepMax(
  store: Store,
  exercise: Exercise,
  performance: string,
  date: number,
): number | null {
  const bodyWeight = queryLatestMeasurement(store, "weight", date)?.value;
  const values = querySetsByPerformance(store, performance)
    .filter((s): s is CompletedSet => s.completed && s.type !== "warm-up")
    .map((s) =>
      volumeToOneRepMax(
        addSelfWeight(exercise.weight, bodyWeight, s.weight),
        s.reps,
      ),
    );
  return values.length === 0 ? null : Math.max(...values);
}
