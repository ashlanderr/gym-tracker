import {
  addSet,
  generateId,
  type Performance,
  type Store,
  type Set,
  type SetType,
  querySetsByPerformance,
} from "../db";
import { updateRecords } from "./records.ts";

const DUPLICATE_SET_TYPE_MAPPING: Record<SetType, SetType> = {
  ["warm-up"]: "warm-up",
  ["working"]: "working",
  ["failure"]: "failure",
  ["light"]: "working",
};

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
    order: oldSet.order,
    type: DUPLICATE_SET_TYPE_MAPPING[oldSet.type],
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
    order: nextOrder,
    type: "working",
    weight: undefined,
    reps: undefined,
    completed: false,
  });

  updateRecords(store, nextSet);

  return nextSet;
}
