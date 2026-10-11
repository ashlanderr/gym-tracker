import {
  DEFAULT_EXERCISE_REPS,
  type Performance,
  queryExerciseById,
  queryLatestMeasurement,
  queryPreviousPerformance,
  querySetsByPerformance,
  type Store,
} from "../db";
import { computeWeightIncrease, type WeightIncrease } from "./recommendations";

// A new weight is offered before the exercise until the person answers it.
// The answer is the weight written into the first working set, so the
// question stays open while no working set has a weight.
export function queryPendingIncrease(
  store: Store,
  performance: Performance,
): WeightIncrease | null {
  const sets = querySetsByPerformance(store, performance.id);
  const working = sets.filter((s) => s.type === "working");
  if (working.length === 0 || working.some((s) => s.weight !== undefined)) {
    return null;
  }

  const exercise = queryExerciseById(store, performance.exercise);
  const prevPerformance = queryPreviousPerformance(
    store,
    performance.exercise,
    performance.program,
    performance.startedAt,
  );
  const prevSets = prevPerformance
    ? querySetsByPerformance(store, prevPerformance.id).filter(
        (s) => s.completed,
      )
    : [];

  return computeWeightIncrease(
    prevSets,
    exercise?.reps ?? DEFAULT_EXERCISE_REPS,
    {
      exerciseWeights: exercise?.weight,
      performanceWeights: performance.weights,
      selfWeight: queryLatestMeasurement(store, performance.startedAt)?.weight,
    },
  );
}
