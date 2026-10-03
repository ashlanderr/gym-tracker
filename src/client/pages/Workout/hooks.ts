import { useEffect, useState } from "react";
import {
  type Exercise,
  type Gym,
  type Performance,
  type RepRange,
  type Set,
  type WeightUnits,
  useQueryCurrentGym,
  useQueryExerciseById,
  useQueryLatestMeasurement,
  useQueryPerformancesByExercise,
  useQueryPerformancesByWorkout,
  useQueryProfile,
  useQuerySetsByExercise,
} from "../../db";
import { useStore } from "../../components";
import {
  getWeightUnits,
  kgToUnits,
  type PerformanceData,
  type PerformanceRecommendations,
  queryEarlierExercises,
  recommendPerformance,
} from "../../domain";
import { UNITS_SHORT, WEIGHT_SIGNS } from "../constants.ts";

// The recommendations of a performance, kept up to date with everything they
// are made from.
export function usePerformanceRecommendations(
  performance: Performance,
): (PerformanceRecommendations & { data: PerformanceData }) | null {
  const store = useStore();
  const exercise = useQueryExerciseById(store, performance.exercise);
  const gym = useQueryCurrentGym(store, performance.user);
  const profile = useQueryProfile(store);
  const bodyWeight = useQueryLatestMeasurement(
    store,
    "weight",
    performance.startedAt,
  );
  const exercisePerformances = useQueryPerformancesByExercise(
    store,
    performance.exercise,
  );
  const exerciseSets = useQuerySetsByExercise(store, performance.exercise);
  const workoutPerformances = useQueryPerformancesByWorkout(
    store,
    performance.workout,
  );

  if (!exercise) return null;

  const data: PerformanceData = {
    performance,
    exercise,
    gym,
    profile,
    bodyWeight: bodyWeight?.value,
    exercisePerformances,
    exerciseSets,
    earlierExercises: queryEarlierExercises(
      store,
      performance,
      workoutPerformances,
    ),
  };

  return { ...recommendPerformance(data), data };
}

export interface SetPlan {
  set: Set;
  sets: Set[];
  exercise: Exercise;
  gym: Gym;
  units: WeightUnits;
  weightKg: number | undefined;
  isSuggestedWeight: boolean;
  reps: number;
  target: RepRange | undefined;
  isFirstOfMovement: boolean;
  data: PerformanceData;
}

// What a set is going to be: the numbers entered, otherwise the recommended.
export function useSetPlan(
  performance: Performance,
  setId: string,
): SetPlan | null {
  const plan = usePerformanceRecommendations(performance);
  if (!plan) return null;

  const { sets, recommendations, data } = plan;
  const index = sets.findIndex((s) => s.id === setId);
  if (index < 0) return null;

  const set = sets[index];
  const recommendation = recommendations[index];
  const { exercise, gym } = data;

  return {
    set,
    sets,
    exercise,
    gym,
    units: getWeightUnits(exercise, gym),
    weightKg: set.weight ?? recommendation?.weight,
    isSuggestedWeight: set.weight === undefined,
    reps: set.reps ?? recommendation?.reps?.max ?? performance.reps.max,
    target: set.type === "warm-up" ? undefined : performance.reps,
    isFirstOfMovement: plan.params.isFirstOfMovement,
    data,
  };
}

export interface FormattedWeight {
  value: string;
  units: string;
  isEmpty: boolean;
}

export function formatWeight(
  plan: SetPlan,
  weightKg: number | undefined,
): FormattedWeight {
  return formatExerciseWeight(plan.exercise, plan.units, weightKg);
}

export function formatExerciseWeight(
  exercise: Exercise,
  units: WeightUnits,
  weightKg: number | undefined,
): FormattedWeight {
  if (weightKg === undefined) return { value: "–", units: "", isEmpty: true };

  const value = formatNumber(kgToUnits(weightKg, units));
  const sign = WEIGHT_SIGNS[exercise.weight.type];

  return {
    value: `${sign}${value}`,
    units: UNITS_SHORT[units],
    isEmpty: false,
  };
}

export function formatNumber(value: number): string {
  return (Math.round(value * 100) / 100).toString();
}

export function formatRange({ min, max }: RepRange): string {
  return min === max ? `${min}` : `${min} – ${max}`;
}

export function useClock(startedAt: number | undefined): string {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  return startedAt !== undefined
    ? formatDuration(Math.max(0, now - startedAt) / 1000)
    : "";
}

export function formatDuration(totalSeconds: number): string {
  const seconds = Math.floor(totalSeconds) % 60;
  const minutes = Math.floor(totalSeconds / 60) % 60;
  const hours = Math.floor(totalSeconds / 3600);
  const ss = seconds.toString().padStart(2, "0");

  return hours
    ? `${hours}:${minutes.toString().padStart(2, "0")}:${ss}`
    : `${minutes}:${ss}`;
}

export interface SetSheetData {
  performance: Performance;
  setId: string;
}
