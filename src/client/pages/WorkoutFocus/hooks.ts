import { useEffect, useState } from "react";
import {
  type Exercise,
  type Gym,
  type Performance,
  type RepRange,
  type Set,
  type WeightUnits,
} from "../../db";
import {
  type FindingReason,
  getWeightUnits,
  kgToUnits,
  type PerformanceData,
  type WorkoutStep,
} from "../../domain";
import { usePerformanceRecommendations } from "../Workout/hooks.ts";
import { UNITS_SHORT, WEIGHT_SIGNS } from "../constants.ts";

export interface StepPlan {
  set: Set;
  sets: Set[];
  exercise: Exercise;
  gym: Gym;
  units: WeightUnits;
  weightKg: number | undefined;
  isSuggestedWeight: boolean;
  previousWeightKg: number | undefined;
  reps: number;
  target: RepRange | undefined;
  isFinding: boolean;
  reason: FindingReason | undefined;
  // The working weight a warm-up leads to.
  workingWeightKg: number | undefined;
  data: PerformanceData;
}

export function useStepPlan(step: WorkoutStep): StepPlan | null {
  const plan = usePerformanceRecommendations(step.performance);
  if (!plan) return null;

  const { sets, recommendations, data } = plan;
  const { exercise, gym, performance } = data;
  const index = sets.findIndex((s) => s.id === step.set.id);
  const set = sets[index] ?? step.set;
  const recommendation = recommendations[index];
  const isWarmUp = set.type === "warm-up";

  const firstWorking = sets.findIndex((s) => s.type !== "warm-up");
  const workingWeightKg =
    firstWorking < 0
      ? undefined
      : (sets[firstWorking].weight ?? recommendations[firstWorking]?.weight);

  // The same set of the previous performance, for the change under the weight.
  const previous = previousPerformance(data);
  const previousSet = data.exerciseSets
    .filter(
      (s) =>
        s.performance === previous?.id && s.completed && s.type === set.type,
    )
    .sort((a, b) => a.order - b.order)[step.number - 1];

  return {
    set,
    sets,
    exercise,
    gym,
    units: getWeightUnits(exercise, gym),
    weightKg: set.weight ?? recommendation?.weight,
    isSuggestedWeight: set.weight === undefined,
    previousWeightKg: isWarmUp ? undefined : previousSet?.weight,
    reps: set.reps ?? recommendation?.reps?.max ?? performance.reps.max,
    target: isWarmUp ? undefined : performance.reps,
    isFinding: recommendation?.isFinding ?? false,
    reason: recommendation?.reason,
    workingWeightKg: isWarmUp ? workingWeightKg : undefined,
    data,
  };
}

// The latest performance of the slot, or of the exercise in general when the
// slot has no history yet.
function previousPerformance({
  performance,
  exercisePerformances,
}: PerformanceData): Performance | undefined {
  const earlier = exercisePerformances
    .filter((p) => p.startedAt < performance.startedAt)
    .sort((a, b) => b.startedAt - a.startedAt);
  return earlier.find((p) => p.slot === performance.slot) ?? earlier[0];
}

export interface FormattedWeight {
  value: string;
  units: string;
  isEmpty: boolean;
}

export function formatWeight(
  plan: StepPlan,
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
