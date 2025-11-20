import {
  DEFAULT_WEIGHT_UNITS,
  type PerformanceWeights,
  type WeightUnits,
  DEFAULT_EXERCISE_WEIGHT,
  type ExerciseWeight,
} from "../../db";
import type { RoundingMode, WeightsConstructor } from "./types.ts";

export function addSelfWeight(
  exerciseWeight: ExerciseWeight | undefined,
  selfWeight: number | undefined,
  performanceWeight: number,
): number {
  exerciseWeight = exerciseWeight ?? DEFAULT_EXERCISE_WEIGHT;
  selfWeight = selfWeight ?? 0;

  switch (exerciseWeight.type) {
    case "full":
      return performanceWeight;

    case "positive":
      return (
        (selfWeight * exerciseWeight.selfWeightPercent) / 100 +
        performanceWeight
      );

    case "negative":
      return (
        (selfWeight * exerciseWeight.selfWeightPercent) / 100 -
        performanceWeight
      );
  }
}

export function subtractSelfWeight(
  exerciseWeight: ExerciseWeight | undefined,
  selfWeight: number | undefined,
  fullWeight: number,
): number {
  exerciseWeight = exerciseWeight ?? DEFAULT_EXERCISE_WEIGHT;
  selfWeight = selfWeight ?? 0;

  switch (exerciseWeight.type) {
    case "full":
      return fullWeight;

    case "positive":
      return fullWeight - (selfWeight * exerciseWeight.selfWeightPercent) / 100;

    case "negative":
      return (selfWeight * exerciseWeight.selfWeightPercent) / 100 - fullWeight;
  }
}

export function volumeToOneRepMax(weight: number, reps: number): number {
  return reps <= 10 //
    ? weight * (36 / (37 - reps))
    : weight * (1 + reps / 30);
}

export function oneRepMaxToWeight(oneRepMax: number, reps: number): number {
  return reps <= 10 //
    ? oneRepMax / (36 / (37 - reps))
    : oneRepMax / (1 + reps / 30);
}

export function oneRepMaxToReps(oneRepMax: number, weight: number): number {
  const w = oneRepMax / weight;
  return w <= 1.333 //
    ? 37 - 36 / w
    : (w - 1) * 30;
}

export function formatRecordValue(value: number) {
  return (Math.round(value * 100) / 100).toLocaleString() + " кг";
}

export function snapWeightKg(
  weights: PerformanceWeights | undefined,
  valueKg: number,
  rounding: RoundingMode = "round",
): number {
  return computeWeights(weights, valueKg, rounding).totalKg;
}

export function computeWeights(
  weights: PerformanceWeights | undefined,
  valueKg: number,
  rounding: RoundingMode = "round",
): WeightsConstructor {
  if (!weights) {
    return {
      units: "kg",
      totalUnits: valueKg,
      totalKg: valueKg,
      count: 1,
    };
  }

  const steps: number[] = [];
  const resultSteps: number[] = [];

  if (Array.isArray(weights.steps)) {
    steps.push(...weights.steps);
  } else if (typeof weights.steps === "number") {
    steps.push(weights.steps);
  } else {
    steps.push(1);
  }

  if (weights.additional) {
    steps.push(weights.additional);
  }

  steps.sort((a, b) => b - a);
  const smallestStep = steps[steps.length - 1];

  const valueUnits = kgToUnits(valueKg, weights.units);
  const base = weights.base ?? 0;
  const withoutBase = valueUnits - base;
  const count = weights.count ?? 1;
  const separate =
    round(withoutBase / count / smallestStep, rounding) * smallestStep;

  let stepped = 0;
  let remaining = separate;

  while (stepped < separate) {
    const stepIndex = steps.findIndex((s) => s <= remaining);
    if (stepIndex < 0) break;
    const stepValue = steps[stepIndex];
    remaining -= stepValue;
    stepped += stepValue;
    resultSteps.push(stepValue);
  }

  const totalUnits = stepped * count + base;
  const combinedSteps = resultSteps.reduce(combineSteps, []);

  return {
    units: weights.units,
    totalKg: unitsToKg(totalUnits, weights.units),
    base: base !== 0 ? base : undefined,
    steps: combinedSteps.length !== 0 ? combinedSteps : undefined,
    count,
    totalUnits,
  };
}

function combineSteps(
  steps: Array<{ weight: number; count: number }>,
  weight: number,
): Array<{ weight: number; count: number }> {
  const lastStep = steps.length > 0 ? steps[steps.length - 1] : null;

  if (lastStep?.weight === weight) {
    return [
      ...steps.slice(0, steps.length - 1),
      {
        weight,
        count: lastStep.count + 1,
      },
    ];
  } else {
    return [...steps, { weight, count: 1 }];
  }
}

export function kgToUnits(
  weightKg: number,
  units: WeightUnits | undefined,
): number {
  switch (units ?? DEFAULT_WEIGHT_UNITS) {
    case "kg":
      return weightKg;
    case "lbs":
      return weightKg / 0.454;
  }
}

export function unitsToKg(
  weightUnits: number,
  units: WeightUnits | undefined,
): number {
  switch (units ?? DEFAULT_WEIGHT_UNITS) {
    case "kg":
      return weightUnits;
    case "lbs":
      return weightUnits * 0.454;
  }
}

function round(value: number, mode: RoundingMode): number {
  switch (mode) {
    case "floor":
      return Math.floor(value);
    case "ceil":
      return Math.ceil(value);
    case "round":
      return Math.round(value);
  }
}
