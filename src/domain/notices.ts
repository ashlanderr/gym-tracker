import {
  DEFAULT_EXERCISE_REPS,
  type Performance,
  queryExerciseById,
  queryLatestMeasurement,
  queryPreviousPerformance,
  querySetsByPerformance,
  type Store,
} from "../db";
import {
  computeWeightIncrease,
  computeWorkingWeight,
  type WeightIncrease,
} from "./recommendations";

const LONG_BREAK_MS = 90 * 24 * 60 * 60 * 1000;

export type PendingWeight =
  | { type: "increase"; increase: WeightIncrease }
  | { type: "unknown"; last?: { weight: number; startedAt: number } };

// Nothing about the weight works without the inventory, so it is asked before
// the exercise until it is set. It comes from the last time, so a new
// exercise asks it once.
export function queryMissingInventory(
  store: Store,
  performance: Performance,
): boolean {
  const exercise = queryExerciseById(store, performance.exercise);
  return (
    (exercise?.equipment ?? "none") !== "none" &&
    performance.weights === undefined
  );
}

// A weight is asked before the exercise until the person answers it. The
// answer is the weight written into the first working set, so the question
// stays open while no working set has a weight. Without a history, or after
// a long break, the app does not know the weight and the person picks it.
// Otherwise a new weight is offered when it is time to raise.
export function queryPendingWeight(
  store: Store,
  performance: Performance,
): PendingWeight | null {
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
  const reps = exercise?.reps ?? DEFAULT_EXERCISE_REPS;
  const context = {
    exerciseWeights: exercise?.weight,
    performanceWeights: performance.weights,
    selfWeight: queryLatestMeasurement(store, performance.startedAt)?.weight,
  };

  const lastWeight = computeWorkingWeight(prevSets, reps, context);
  if (!prevPerformance || lastWeight === undefined) return { type: "unknown" };

  if (performance.startedAt - prevPerformance.startedAt > LONG_BREAK_MS) {
    return {
      type: "unknown",
      last: { weight: lastWeight, startedAt: prevPerformance.startedAt },
    };
  }

  const increase = computeWeightIncrease(prevSets, reps, context);
  return increase && { type: "increase", increase };
}
