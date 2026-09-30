import * as Y from "yjs";
import {
  clearCollections,
  collection,
  type Performance,
  queryCollection,
  queryDataSummary,
  queryProfile,
  queryRecordsByWorkout,
  querySetsByPerformance,
  saveProfile,
  type Store,
  updateWorkout,
  type Workout,
} from "../db";
import { MEDAL_RECORDS, updateRecords } from "./records.ts";

// What the screen after a sign-in reports: the numbers somebody recognises
// their own history by.
export interface HistorySummary {
  workouts: number;
  lastWorkout: number | null;
  records: number;
  recordExercises: number;
}

export function summarizeHistory(store: Store): HistorySummary {
  const completed = queryCollection<Workout>(
    collection(store.personal, "workouts"),
    { completedAt: { ne: null } },
  );
  const { records, recordExercises } = queryDataSummary(store);
  return {
    workouts: completed.length,
    lastWorkout: completed.length
      ? Math.max(...completed.map((w) => w.startedAt))
      : null,
    records,
    recordExercises,
  };
}

// Brings the history kept on the device into the account's document. Yjs
// joins the collections by id, and applying what the account already has
// changes nothing. The profile is the one thing under a fixed id: the
// account's answers stay, whatever the device answered since.
export function mergeInto(target: Store, source: Store) {
  const profile = queryProfile(target);
  Y.applyUpdate(target.personal, Y.encodeStateAsUpdate(source.personal));
  target.personal.transact(() => {
    if (profile) saveProfile(target, profile);
    rebuildRecords(target);
  });
}

// Each record says it beat the one before, and two histories side by side
// have two "first" records per lift. Counted again from the start, in the
// order the workouts happened.
export function rebuildRecords(store: Store) {
  clearCollections(store, ["records"]);

  const performances = queryCollection<Performance>(
    collection(store.personal, "performances"),
    {},
  ).sort((a, b) => a.startedAt - b.startedAt);

  for (const performance of performances) {
    const set = querySetsByPerformance(store, performance.id).find(
      (s) => s.completed,
    );
    if (set) updateRecords(store, set);
  }

  const workouts = queryCollection<Workout>(
    collection(store.personal, "workouts"),
    { completedAt: { ne: null } },
  );
  for (const workout of workouts) {
    const medals = queryRecordsByWorkout(store, workout.id).filter((r) =>
      MEDAL_RECORDS.includes(r.type),
    ).length;
    if (medals !== (workout.records ?? 0)) {
      updateWorkout(store, { ...workout, records: medals || undefined });
    }
  }
}
