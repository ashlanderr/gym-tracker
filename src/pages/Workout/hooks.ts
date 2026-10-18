import {
  type CompletedSet,
  DEFAULT_EXERCISE_REPS,
  DEFAULT_WEIGHT_UNITS,
  type Exercise,
  type Performance,
  type Set,
  useQueryExerciseById,
  useQueryLatestMeasurement,
  useQueryPerformancesByWorkout,
  useQueryPreviousPerformance,
  useQuerySetsByPerformance,
  type WeightUnits,
} from "../../db";
import { useStore } from "../../components";
import {
  buildRecommendations,
  startsRest,
  kgToUnits,
  type RecSetData,
  type RepRange,
} from "../../domain";
import { assertNever } from "../../utils";

export interface SetRowData {
  set: Set;
  number: string;
  prevSet: CompletedSet | undefined;
  recSet: RecSetData | undefined;
  startsRest: boolean;
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

  const prevPerformance = useQueryPreviousPerformance(
    store,
    performance.exercise,
    performance.startedAt,
    performance.program,
  );

  const prevSets = useQuerySetsByPerformance(
    store,
    prevPerformance?.id ?? "",
  ).filter((s) => s.completed);

  // Without the inventory a weight cannot be put together, so none is
  // suggested until it is set.
  const isInventoryMissing =
    (exercise?.equipment ?? "none") !== "none" &&
    performance.weights === undefined;

  const recommendations = buildRecommendations({
    currentSets: sets,
    previousSets: prevSets,
    performanceWeights: performance.weights,
    exerciseWeights: exercise?.weight,
    exerciseReps: exercise?.reps ?? DEFAULT_EXERCISE_REPS,
    selfWeight: measurement?.weight,
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
      startsRest: startsRest(sets, set),
      recSet: isInventoryMissing
        ? { ...recommendations[index], weight: undefined }
        : recommendations[index],
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

export function formatPlannedReps({ min, max }: RepRange): string {
  return min === max ? min.toString() : `${min}–${max}`;
}

function setNumber(set: Set, workingCount: number): string {
  switch (set.type) {
    case "warm-up":
      return "W";
    case "working":
      return workingCount.toString();
    default:
      return assertNever(set.type);
  }
}
