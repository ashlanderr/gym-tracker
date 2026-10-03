import {
  addSet,
  type CompletedSet,
  deleteSet,
  type DraftSet,
  generateId,
  type Performance,
  type Store,
  type Set,
  querySetsByPerformance,
  updateSet,
} from "../db";
import { updateRecords } from "./records.ts";
import {
  planWarmUps,
  queryPerformanceData,
  recommendPerformance,
  type RecSetData,
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

// The warm-up follows the first working weight until a working set is done.
// It is cheap to redo, so a new weight rebuilds it, done warm-up sets
// included.
export function rebuildWarmUps(store: Store, performance: Performance) {
  const data = queryPerformanceData(store, performance);
  if (!data) return;

  const { sets, recommendations, params } = recommendPerformance(data);
  if (sets.some((s) => s.type === "working" && s.completed)) return;

  const first = sets.findIndex((s) => s.type !== "warm-up");
  const workingWeight =
    first < 0
      ? undefined
      : (sets[first].weight ?? recommendations[first].weight);
  const planned =
    workingWeight === undefined
      ? []
      : planWarmUps({ ...params, workingWeight }).map((w) => w.weight);
  const current = sets.flatMap((s, i) =>
    s.type === "warm-up" ? [s.weight ?? recommendations[i].weight] : [],
  );
  if (isSameWeights(planned, current)) return;

  for (const set of sets) {
    if (set.type !== "warm-up") continue;
    deleteSet(store, set);
    updateRecords(store, set);
  }
  insertWarmUps(store, performance);
}

export type SetQuestion = "finding" | "last";

export interface SetCompletion {
  set: CompletedSet;
  rest: boolean;
  question: SetQuestion | undefined;
}

// Completes a set with the numbers entered, otherwise the recommended ones.
// Without a weight there is nothing to complete.
export function completeSet(
  store: Store,
  performance: Performance,
  set: DraftSet,
  recommendation: RecSetData | undefined,
): SetCompletion | undefined {
  const weight = set.weight ?? recommendation?.weight;
  if (weight === undefined) return undefined;

  const completed: CompletedSet = {
    ...set,
    weight,
    reps: set.reps ?? recommendation?.reps?.max ?? performance.reps.max,
    completed: true,
    effort: undefined,
  };
  updateSet(store, completed);
  updateRecords(store, completed);

  const sets = querySetsByPerformance(store, performance.id);
  const later = sets.slice(sets.findIndex((s) => s.id === set.id) + 1);
  const laterWorking = later.filter((s) => s.type === "working");

  // Finding moves the weight only forward: once a later set is done, the
  // answer has nothing left to change. Numbers left on later sets from an
  // earlier pass would hide the new recommendation, so they are dropped.
  const isFinding =
    (recommendation?.isFinding ?? false) &&
    !laterWorking.some((s) => s.completed);
  if (isFinding) {
    for (const s of laterWorking) {
      if (!s.completed) {
        updateSet(store, { ...s, weight: undefined, reps: undefined });
      }
    }
  }

  // TODO: ask after the last set only when it reached the top of the range,
  // so the next workout would raise the weight. Progression doesn't read the
  // rating yet, see TODO.md.
  const isLastWorking = set.type === "working" && laterWorking.length === 0;

  return {
    set: completed,
    // No rest between warm-up sets: the first one comes before the first
    // working set.
    rest: !(set.type === "warm-up" && later[0]?.type === "warm-up"),
    question: isFinding ? "finding" : isLastWorking ? "last" : undefined,
  };
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

function isSameWeights(
  a: Array<number | undefined>,
  b: Array<number | undefined>,
): boolean {
  return (
    a.length === b.length &&
    a.every((weight, i) => {
      const other = b[i];
      return (
        weight === other ||
        (weight !== undefined &&
          other !== undefined &&
          Math.abs(weight - other) < 1e-6)
      );
    })
  );
}
