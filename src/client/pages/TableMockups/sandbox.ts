import * as Y from "yjs";
import {
  defaultGym,
  type DraftSet,
  type Performance,
  queryPerformancesByWorkout,
  querySetsByPerformance,
  type Store,
  updateGym,
  updatePerformance,
  updateSet,
  updateWorkout,
  type Workout,
} from "../../db";
import {
  addPerformance,
  addWorkout,
  completeSet,
  duplicateWorkout,
  queryPerformanceData,
  recommendPerformance,
} from "../../domain";

const USER = "mockup";
const DAY = 24 * 60 * 60 * 1000;

export interface Sandbox {
  store: Store;
  workout: Workout;
}

// A workout in the middle, with a previous one to compare against, kept in
// memory only. The sets are done through the same code as in the table, so
// warm-ups, recommendations and records are the real ones.
export function createSandbox(): Sandbox {
  const store: Store = { documentId: USER, personal: new Y.Doc() };
  updateGym(store, {
    ...defaultGym(USER),
    bars: { units: "kg", items: [20] },
    plates: { units: "kg", items: [25, 20, 15, 10, 5, 2.5, 1.25] },
    dumbbells: [{ units: "kg", min: 2, max: 40, step: 2 }],
  });

  const past = updateWorkout(store, {
    ...addWorkout(store, USER),
    startedAt: Date.now() - 3 * DAY,
  });
  const pastBench = addPerformance(store, past, "bench_press");
  doSets(store, pastBench, [0, 1, 2], { weight: 102.5, reps: 8 });
  const pastLegPress = updatePerformance(store, {
    ...addPerformance(store, past, "leg_press_plates"),
    reps: { min: 12, max: 15 },
  });
  doSets(store, pastLegPress, [0, 1, 2], { weight: 212.5, reps: 15 });
  const pastCurl = addPerformance(store, past, "preacher_dumbbell_curl");
  doSets(store, pastCurl, [0, 1, 2], { weight: 12, reps: 12 });

  const workout = duplicateWorkout(store, past);
  const [bench, legPress, curl] = queryPerformancesByWorkout(
    store,
    workout.id,
  ).sort((a, b) => a.order - b.order);

  doSets(store, bench, [0, 1]);
  doSet(store, bench, 2, { weight: 105, reps: 8 });
  doSet(store, bench, 3, { weight: 105, reps: 8 });
  doSet(store, bench, 4, { weight: 105, reps: 7 });

  doSets(store, legPress, [0, 1]);
  doSet(store, legPress, 2, { weight: 220, reps: 15 });
  doSet(store, legPress, 3, { weight: 220, reps: 13 });
  const [last] = querySetsByPerformance(store, legPress.id).slice(-1);
  updateSet(store, { ...last, weight: 220 });

  const pecDeck = addPerformance(store, workout, "pec_deck");
  updatePerformance(store, { ...pecDeck, order: curl.order });
  updatePerformance(store, { ...curl, order: pecDeck.order });

  return { store, workout };
}

function doSets(
  store: Store,
  performance: Performance,
  indexes: number[],
  patch: Partial<DraftSet> = {},
) {
  for (const index of indexes) doSet(store, performance, index, patch);
}

function doSet(
  store: Store,
  performance: Performance,
  index: number,
  patch: Partial<DraftSet> = {},
) {
  const data = queryPerformanceData(store, performance);
  if (!data) return;
  const { sets, recommendations } = recommendPerformance(data);
  const set = { ...sets[index], ...patch } as DraftSet;
  completeSet(store, performance, set, recommendations[index]);
}
