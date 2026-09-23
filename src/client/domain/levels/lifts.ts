import {
  type AnchorId,
  type AnchorSet,
  type CompletedSet,
  type Exercise,
  type Profile,
  queryExerciseById,
  queryLatestMeasurement,
  queryPerformancesByExercise,
  querySetsByPerformance,
  type Store,
} from "../../db";
import { addSelfWeight, volumeToOneRepMax } from "../weights";
import {
  ANCHOR_EXERCISES,
  NOVICE_ONE_REP_MAX,
  STRENGTH_WINDOW_MS,
} from "./constants.ts";

// Where today's one-rep max of a lift comes from: the best set of the
// window, the onboarding answer, its default while nothing was answered, or
// nothing at all because the lift was done, but too long ago to say anything.
export type LiftSource = "history" | "survey" | "default" | "stale";

export type LiftStrength =
  | {
      anchor: AnchorId;
      source: "history" | "survey" | "default";
      oneRepMax: number;
    }
  | { anchor: AnchorId; source: "stale"; oneRepMax: null };

export function queryLiftStrength(
  store: Store,
  profile: Profile,
  anchor: AnchorId,
  now: number,
): LiftStrength {
  const exercise = queryExerciseById(store, ANCHOR_EXERCISES[anchor]);
  if (!exercise) throw new Error(`No exercise for the ${anchor} anchor`);

  // TODO: count the neighbouring lifts of the same anchor too, converted by
  // their strength factor, not the anchor exercise alone.
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

  if (done.length !== 0) {
    const recent = done.filter((d) => d.startedAt >= now - STRENGTH_WINDOW_MS);
    return recent.length === 0
      ? { anchor, source: "stale", oneRepMax: null }
      : {
          anchor,
          source: "history",
          oneRepMax: Math.max(...recent.map((d) => d.best)),
        };
  }

  const answered = profile.anchors[anchor];
  if (answered) {
    return {
      anchor,
      source: "survey",
      oneRepMax: setOneRepMax(store, exercise, answered, answered.createdAt),
    };
  }

  return {
    anchor,
    source: "default",
    oneRepMax: NOVICE_ONE_REP_MAX[anchor][profile.sex],
  };
}

function bestOneRepMax(
  store: Store,
  exercise: Exercise,
  performance: string,
  date: number,
): number | null {
  const values = querySetsByPerformance(store, performance)
    .filter((s): s is CompletedSet => s.completed && s.type !== "warm-up")
    .map((s) => setOneRepMax(store, exercise, s, date));
  return values.length === 0 ? null : Math.max(...values);
}

function setOneRepMax(
  store: Store,
  exercise: Exercise,
  { weight, reps }: Pick<AnchorSet, "weight" | "reps">,
  date: number,
): number {
  const bodyWeight = queryLatestMeasurement(store, "weight", date)?.value;
  return volumeToOneRepMax(
    addSelfWeight(exercise.weight, bodyWeight, weight),
    reps,
  );
}
