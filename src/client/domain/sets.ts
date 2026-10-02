import {
  addSet,
  generateId,
  type Performance,
  type Store,
  type Set,
  querySetsByPerformance,
} from "../db";
import { updateRecords } from "./records.ts";
import {
  planWarmUps,
  queryPerformanceData,
  recommendPerformance,
} from "./recommendations";

export function duplicateSet(
  store: Store,
  newPerformance: Performance,
  oldSet: Set,
): Set {
  return addSet(store, {
    id: generateId(),
    user: newPerformance.user,
    workout: newPerformance.workout,
    exercise: newPerformance.exercise,
    performance: newPerformance.id,
    slot: newPerformance.slot,
    order: oldSet.order,
    type: "working",
    weight: undefined,
    reps: undefined,
    completed: false,
  });
}

// Inserts the warm-up the general rule gives before the first working set.
// The caller decides when a warm-up may still be added at all.
export function insertWarmUps(store: Store, performance: Performance) {
  const data = queryPerformanceData(store, performance);
  if (!data) return;

  const { sets, recommendations, params } = recommendPerformance(data);
  const first = sets.findIndex((s) => s.type !== "warm-up");
  if (first < 0) return;

  const workingWeight = sets[first].weight ?? recommendations[first].weight;
  if (workingWeight === undefined) return;

  const warmUps = planWarmUps({ ...params, workingWeight });
  warmUps.forEach((_, index) => {
    addSet(store, {
      id: generateId(),
      user: performance.user,
      workout: performance.workout,
      exercise: performance.exercise,
      performance: performance.id,
      slot: performance.slot,
      order: sets[first].order - warmUps.length + index,
      type: "warm-up",
      weight: undefined,
      reps: undefined,
      completed: false,
    });
  });
}

export function addNextSet(store: Store, performance: Performance): Set {
  const sets = querySetsByPerformance(store, performance.id);
  const nextOrder = Math.max(-1, ...sets.map((s) => s.order)) + 1;

  const nextSet = addSet(store, {
    id: generateId(),
    user: performance.user,
    workout: performance.workout,
    performance: performance.id,
    exercise: performance.exercise,
    slot: performance.slot,
    order: nextOrder,
    type: "working",
    weight: undefined,
    reps: undefined,
    completed: false,
  });

  updateRecords(store, nextSet);

  return nextSet;
}
