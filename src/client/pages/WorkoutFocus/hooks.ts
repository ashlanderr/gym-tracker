import { useEffect, useState } from "react";
import {
  type Exercise,
  type Gym,
  type RepRange,
  type Set,
  useQueryCurrentGym,
  useQueryExerciseById,
  useQueryLatestMeasurement,
  useQueryPreviousPerformance,
  useQuerySetsByPerformance,
  type WeightUnits,
} from "../../db";
import { useStore } from "../../components";
import {
  buildRecommendations,
  getWeightUnits,
  kgToUnits,
  type WorkoutStep,
} from "../../domain";
import { UNITS_SHORT } from "../constants.ts";

export interface StepPlan {
  set: Set;
  exercise: Exercise;
  gym: Gym;
  units: WeightUnits;
  weightKg: number | undefined;
  isSuggestedWeight: boolean;
  previousWeightKg: number | undefined;
  reps: number;
  target: RepRange | undefined;
}

export function useStepPlan(step: WorkoutStep): StepPlan | null {
  const store = useStore();
  const { performance } = step;
  const exercise = useQueryExerciseById(store, performance.exercise);
  const gym = useQueryCurrentGym(store, performance.user);
  const measurement = useQueryLatestMeasurement(store, performance.startedAt);
  const sets = useQuerySetsByPerformance(store, performance.id);
  const previous = useQueryPreviousPerformance(
    store,
    performance.slot,
    performance.exercise,
    performance.startedAt,
  );
  const previousSets = useQuerySetsByPerformance(
    store,
    previous?.id ?? "",
  ).filter((s) => s.completed);

  if (!exercise) return null;

  const set = sets.find((s) => s.id === step.set.id) ?? step.set;
  const isWarmUp = set.type === "warm-up";

  const recommendations = buildRecommendations({
    currentSets: sets,
    previousSets,
    exercise,
    gym,
    reps: performance.reps,
    selfWeight: measurement?.weight,
  });
  const recommendation = recommendations[sets.indexOf(set)];
  const previousSet = previousSets.filter((s) => s.type === set.type)[
    step.number - 1
  ];

  const bodyWeightOnly = exercise.load.type === "none" ? 0 : undefined;

  return {
    set,
    exercise,
    gym,
    units: getWeightUnits(exercise, gym),
    weightKg: set.weight ?? recommendation?.weight ?? bodyWeightOnly,
    isSuggestedWeight: set.weight === undefined,
    previousWeightKg: isWarmUp ? undefined : previousSet?.weight,
    reps: set.reps ?? recommendation?.reps?.max ?? performance.reps.max,
    target: isWarmUp ? undefined : performance.reps,
  };
}

export interface FormattedWeight {
  value: string;
  units: string;
  isText: boolean;
}

// Exercises that add weight to the body show the addition, and plain body
// weight reads as words on the set screen.
export function formatWeight(
  plan: StepPlan,
  weightKg: number | undefined,
  { bodyWeightAsText = true } = {},
): FormattedWeight {
  if (weightKg === undefined) return { value: "—", units: "", isText: false };

  const value = formatNumber(kgToUnits(weightKg, plan.units));
  const units = UNITS_SHORT[plan.units];

  if (plan.exercise.weight.type !== "positive") {
    return { value, units, isText: false };
  }

  if (weightKg === 0 && bodyWeightAsText) {
    return { value: "Свой вес", units: "", isText: true };
  }

  return { value: `+${value}`, units, isText: false };
}

export function formatWeightChange(plan: StepPlan): string {
  const { weightKg, previousWeightKg } = plan;
  if (weightKg === undefined || previousWeightKg === undefined) return "";

  const delta = kgToUnits(weightKg - previousWeightKg, plan.units);
  if (Math.abs(delta) < 1e-3) return "";

  const sign = delta > 0 ? "+" : "−";
  return `${sign}${formatNumber(Math.abs(delta))} ${UNITS_SHORT[plan.units]}`;
}

export function formatNumber(value: number): string {
  return (Math.round(value * 100) / 100).toString();
}

export function formatRange({ min, max }: RepRange): string {
  return min === max ? `${min}` : `${min} – ${max}`;
}

export function useRestSeconds(deadline: number | null): number {
  const [seconds, setSeconds] = useState(() => secondsUntil(deadline));

  useEffect(() => {
    const update = () => setSeconds(secondsUntil(deadline));
    update();
    if (!deadline) return;

    const interval = setInterval(update, 250);
    return () => clearInterval(interval);
  }, [deadline]);

  return seconds;
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

function secondsUntil(deadline: number | null): number {
  return deadline ? Math.max(0, Math.ceil((deadline - Date.now()) / 1000)) : 0;
}
