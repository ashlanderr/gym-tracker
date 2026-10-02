import {
  type CompletedSet,
  type Exercise,
  type Gym,
  type Performance,
  type Profile,
  queryCurrentGym,
  queryExerciseById,
  queryLatestMeasurement,
  queryPerformancesByExercise,
  queryPerformancesByWorkout,
  queryProfile,
  querySetsByExercise,
  type Set,
  type Store,
} from "../../db";
import { HISTORY_LIMIT } from "./constants.ts";
import { buildRecommendations } from "./recommendations.ts";
import { isFirstOfMovement } from "./warm-up.ts";
import type { RecommendationParams, RecSetData } from "./types.ts";

// Everything the recommendations of one performance are made from, as read
// from the database.
export interface PerformanceData {
  performance: Performance;
  exercise: Exercise;
  gym: Gym;
  profile: Profile | null;
  bodyWeight: number | undefined;
  exercisePerformances: Performance[];
  exerciseSets: Set[];
  // Exercises before this one in the workout.
  earlierExercises: Exercise[];
}

export interface PerformanceRecommendations {
  // The sets of the performance, in order, with a recommendation each.
  sets: Set[];
  recommendations: RecSetData[];
  params: RecommendationParams;
}

export function recommendPerformance(
  data: PerformanceData,
): PerformanceRecommendations {
  const { performance, exercise, exerciseSets } = data;

  const sets = exerciseSets
    .filter((s) => s.performance === performance.id)
    .sort((a, b) => a.order - b.order);

  const earlier = data.exercisePerformances
    .filter(
      (p) => p.id !== performance.id && p.startedAt < performance.startedAt,
    )
    .sort((a, b) => a.startedAt - b.startedAt)
    .slice(-HISTORY_LIMIT);

  const previousSets = earlier.flatMap((p) =>
    exerciseSets
      .filter((s): s is CompletedSet => s.performance === p.id && s.completed)
      .sort((a, b) => a.order - b.order),
  );

  const params: RecommendationParams = {
    currentSets: sets,
    previousSets,
    exercise,
    gym: data.gym,
    reps: performance.reps,
    sex: data.profile?.sex,
    selfWeight: data.bodyWeight,
    isFirstOfMovement: isFirstOfMovement(exercise, data.earlierExercises),
  };

  return { sets, recommendations: buildRecommendations(params), params };
}

export function queryPerformanceData(
  store: Store,
  performance: Performance,
): PerformanceData | null {
  const exercise = queryExerciseById(store, performance.exercise);
  if (!exercise) return null;

  return {
    performance,
    exercise,
    gym: queryCurrentGym(store, performance.user),
    profile: queryProfile(store),
    bodyWeight: queryLatestMeasurement(store, "weight", performance.startedAt)
      ?.value,
    exercisePerformances: queryPerformancesByExercise(store, exercise.id),
    exerciseSets: querySetsByExercise(store, exercise.id),
    earlierExercises: queryEarlierExercises(
      store,
      performance,
      queryPerformancesByWorkout(store, performance.workout),
    ),
  };
}

export function queryEarlierExercises(
  store: Store,
  performance: Performance,
  workoutPerformances: Performance[],
): Exercise[] {
  return workoutPerformances
    .filter((p) => p.order < performance.order)
    .flatMap((p) => queryExerciseById(store, p.exercise) ?? []);
}
