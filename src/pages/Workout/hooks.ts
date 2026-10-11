import {
  type CompletedSet,
  DEFAULT_EXERCISE_REPS,
  DEFAULT_WEIGHT_UNITS,
  type Exercise,
  type MuscleType,
  type Performance,
  queryExerciseById,
  type Set,
  useQueryExerciseById,
  useQueryLatestMeasurement,
  useQueryPerformancesByWorkout,
  useQueryPreviousPerformance,
  useQuerySetsByPerformance,
  useQuerySetsByWorkout,
  type WeightUnits,
} from "../../db";
import { useStore } from "../../components";
import {
  buildRecommendations,
  computeWorkoutStatuses,
  groupSets,
  kgToUnits,
  type RecSetData,
  type RepRange,
  type WorkoutStatuses,
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

export interface WorkoutState extends WorkoutStatuses {
  performances: Performance[];
  sets: Set[];
  setsByPerformance: Map<string, Set[]>;
  muscles: Map<string, MuscleType[]>;
}

// The exercises of a workout with what can be done now, the same for the
// list and the notices before an exercise.
export function useWorkoutState(workoutId: string): WorkoutState {
  const store = useStore();
  const performances = useQueryPerformancesByWorkout(store, workoutId);
  const sets = useQuerySetsByWorkout(store, workoutId);
  const setsByPerformance = groupSets(sets);
  const muscles = new Map(
    performances.map((p) => [
      p.id,
      queryExerciseById(store, p.exercise)?.muscles ?? [],
    ]),
  );

  return {
    performances,
    sets,
    setsByPerformance,
    muscles,
    ...computeWorkoutStatuses(performances, setsByPerformance, muscles),
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
