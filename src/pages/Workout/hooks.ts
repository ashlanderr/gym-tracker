import {
  type CompletedSet,
  DEFAULT_EXERCISE_REPS,
  DEFAULT_WEIGHT_UNITS,
  type Exercise,
  type Performance,
  type Record,
  type Set,
  useQueryExerciseById,
  useQueryLatestMeasurement,
  useQueryPerformancesByWorkout,
  useQueryPreviousPerformance,
  useQueryPreviousRecordByExercise,
  useQuerySetsByPerformance,
  type WeightUnits,
} from "../../db";
import { useStore } from "../../components";
import {
  buildRecommendations,
  kgToUnits,
  type RecSetData,
} from "../../domain";
import { assertNever } from "../../utils";

export interface SetRowData {
  set: Set;
  number: string;
  prevSet: CompletedSet | undefined;
  recSet: RecSetData | undefined;
}

export interface PerformanceSets {
  exercise: Exercise | null;
  sets: Set[];
  prevSets: CompletedSet[];
  rows: SetRowData[];
  units: WeightUnits;
}

// The sets of a performance next to the previous time and the recommended
// numbers, the same way for the table and the sheets.
export function usePerformanceSets(performance: Performance): PerformanceSets {
  const store = useStore();
  const exercise = useQueryExerciseById(store, performance.exercise);
  const sets = useQuerySetsByPerformance(store, performance.id);
  const measurement = useQueryLatestMeasurement(store, performance.startedAt);

  const trainingMax = useQueryPreviousRecordByExercise(
    store,
    "training_max",
    performance.exercise,
    performance.program,
    performance.startedAt - 1,
  );

  const oneRepMax = useQueryPreviousRecordByExercise(
    store,
    "one_rep_max",
    performance.exercise,
    performance.program,
    performance.startedAt - 1,
  );

  const prevPerformance = useQueryPreviousPerformance(
    store,
    performance.exercise,
    performance.startedAt,
    performance.periodization,
    performance.program,
  );

  const prevSets = useQuerySetsByPerformance(
    store,
    prevPerformance?.id ?? "",
  ).filter((s) => s.completed);

  const recommendations = buildRecommendations({
    currentSets: sets,
    previousSets: prevSets,
    performanceWeights: performance.weights,
    exerciseWeights: exercise?.weight,
    exerciseReps: exercise?.reps ?? DEFAULT_EXERCISE_REPS,
    selfWeight: measurement?.weight,
    periodization: performance.periodization,
    oneRepMax: selectLatestRepMax(trainingMax, oneRepMax) ?? undefined,
  });

  const prevWarmUp = prevSets.filter((s) => s.type === "warm-up");
  const prevWorking = prevSets.filter((s) => s.type !== "warm-up");
  let warmUpIndex = 0;
  let workingIndex = 0;

  const rows = sets.map((set, index): SetRowData => {
    let prevSet: CompletedSet | undefined;

    if (set.type === "warm-up") {
      prevSet = prevWarmUp[warmUpIndex];
      warmUpIndex += 1;
    } else {
      prevSet = prevWorking[workingIndex];
      workingIndex += 1;
    }

    return {
      set,
      number: setNumber(set, workingIndex),
      prevSet,
      recSet: recommendations[index],
    };
  });

  return {
    exercise,
    sets,
    prevSets,
    rows,
    units: performance.weights?.units ?? DEFAULT_WEIGHT_UNITS,
  };
}

// The performance as it is now: sheets get a copy when they open, and the
// inventory may change while they are open.
export function useLivePerformance(snapshot: Performance): Performance | null {
  const store = useStore();
  const performances = useQueryPerformancesByWorkout(store, snapshot.workout);
  return performances.find((p) => p.id === snapshot.id) ?? null;
}

export function formatWeightUnits(
  weightKg: number | undefined,
  units: WeightUnits | undefined,
): string {
  if (weightKg === undefined) return "–";
  return (Math.round(kgToUnits(weightKg, units) * 100) / 100).toString();
}

// The reps of an exercise at a glance: its own range when one is set,
// otherwise what was done the last time.
export function formatPlannedReps(
  exercise: Exercise | null,
  prevSet: Set | undefined,
): string {
  const range = exercise?.reps;
  if (range && typeof range !== "string") {
    return range.min === range.max
      ? range.min.toString()
      : `${range.min}–${range.max}`;
  }
  return prevSet?.reps?.toString() ?? "?";
}

function setNumber(set: Set, workingCount: number): string {
  switch (set.type) {
    case "warm-up":
      return "W";
    case "working":
      return workingCount.toString();
    case "failure":
      return "F";
    case "light":
      return "L";
    default:
      return assertNever(set.type);
  }
}

function selectLatestRepMax(a: Record | null, b: Record | null): Record | null {
  if (!a) return b;
  if (!b) return a;
  return a.createdAt > b.createdAt ? a : b;
}
