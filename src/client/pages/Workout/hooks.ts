import {
  type Performance,
  useQueryCurrentGym,
  useQueryExerciseById,
  useQueryLatestMeasurement,
  useQueryPerformancesByExercise,
  useQueryPerformancesByWorkout,
  useQueryProfile,
  useQuerySetsByExercise,
} from "../../db";
import { useStore } from "../../components";
import {
  type PerformanceData,
  type PerformanceRecommendations,
  queryEarlierExercises,
  recommendPerformance,
} from "../../domain";

// The recommendations of a performance, kept up to date with everything they
// are made from.
export function usePerformanceRecommendations(
  performance: Performance,
): (PerformanceRecommendations & { data: PerformanceData }) | null {
  const store = useStore();
  const exercise = useQueryExerciseById(store, performance.exercise);
  const gym = useQueryCurrentGym(store, performance.user);
  const profile = useQueryProfile(store);
  const bodyWeight = useQueryLatestMeasurement(
    store,
    "weight",
    performance.startedAt,
  );
  const exercisePerformances = useQueryPerformancesByExercise(
    store,
    performance.exercise,
  );
  const exerciseSets = useQuerySetsByExercise(store, performance.exercise);
  const workoutPerformances = useQueryPerformancesByWorkout(
    store,
    performance.workout,
  );

  if (!exercise) return null;

  const data: PerformanceData = {
    performance,
    exercise,
    gym,
    profile,
    bodyWeight: bodyWeight?.value,
    exercisePerformances,
    exerciseSets,
    earlierExercises: queryEarlierExercises(
      store,
      performance,
      workoutPerformances,
    ),
  };

  return { ...recommendPerformance(data), data };
}
