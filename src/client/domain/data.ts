import {
  ALL_COLLECTIONS,
  clearCollections,
  collection,
  HISTORY_COLLECTIONS,
  queryCollection,
  type Store,
  updateWorkout,
  type Workout,
} from "../db";

// A clean slate that keeps the training: every set is still there, and the
// next best one earns its medal again. The counts on finished workouts go
// too, or the history would keep medals nobody can find.
export function resetRecords(store: Store) {
  const workouts = queryCollection<Workout>(
    collection(store.personal, "workouts"),
    {},
  );
  store.personal.transact(() => {
    clearCollections(store, ["records"]);
    for (const { records, ...workout } of workouts) {
      if (records !== undefined) updateWorkout(store, workout);
    }
  });
}

// The workout under way goes with the rest: it is history in the making.
export function deleteWorkoutHistory(store: Store) {
  clearCollections(store, HISTORY_COLLECTIONS);
}

// As after installing: without a profile the app opens on the onboarding.
export function deleteAllData(store: Store) {
  clearCollections(store, ALL_COLLECTIONS);
}
