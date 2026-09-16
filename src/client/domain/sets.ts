import {
  addSet,
  generateId,
  type Performance,
  type Store,
  type Set,
  querySetsByPerformance,
} from "../db";
import { updateRecords } from "./records.ts";

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
    type: oldSet.type,
    weight: undefined,
    reps: undefined,
    completed: false,
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
