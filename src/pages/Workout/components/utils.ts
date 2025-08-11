import {
  DEFAULT_AUTO_WEIGHTS,
  DEFAULT_WEIGHT_UNITS,
  type PerformanceWeights,
  type WeightUnits,
} from "../../../db/performances.ts";
import type { WeightsConstructor } from "./Performance/types.ts";
import {
  DEFAULT_EXERCISE_WEIGHT,
  type ExerciseWeight,
} from "../../../db/exercises.ts";

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
  return weight * (1 + reps / 30);
}

export function oneRepMaxToWeight(oneRepMax: number, reps: number): number {
  return oneRepMax / (1 + reps / 30);
}

export function oneRepMaxToReps(oneRepMax: number, weight: number): number {
  return (oneRepMax / weight - 1) * 30;
}

export function formatRecordValue(value: number) {
  return (Math.round(value * 100) / 100).toLocaleString();
}

export function snapWeightKg(
  weights: PerformanceWeights | undefined,
  valueKg: number,
): number {
  return computeWeights(weights, valueKg).totalKg;
}

export function computeWeights(
  weights: PerformanceWeights | undefined,
  valueKg: number,
): WeightsConstructor {
  if (!weights) {
    return {
      units: "kg",
      totalUnits: valueKg,
      totalKg: valueKg,
      count: 1,
    };
  }

  const resultSteps: number[] = [];

  const valueUnits = kgToUnits(valueKg, weights.units);
  const base = weights.base ?? 0;
  const withoutBase = valueUnits - base;
  const count = weights.count ?? 1;
  const separate = withoutBase / count;
  let stepped = 0;
  let remaining = 0;

  if (Array.isArray(weights.steps) && weights.steps.length !== 0) {
    const steps = weights.steps.sort((a, b) => b - a);
    remaining = separate;
    while (stepped < separate) {
      const stepIndex = steps.findIndex((s) => s <= remaining);
      if (stepIndex < 0) break;
      const stepValue = steps[stepIndex];
      remaining -= stepValue;
      stepped += stepValue;
      resultSteps.push(stepValue);
    }
  } else if (typeof weights.steps === "number") {
    stepped = Math.floor(separate / weights.steps) * weights.steps;
    resultSteps.push(stepped);
  } else {
    stepped = Math.floor(separate);
    resultSteps.push(stepped);
  }

  remaining = (separate - stepped) * count;

  if (weights.additional) {
    remaining = Math.round(remaining / weights.additional) * weights.additional;
  } else {
    remaining = 0;
  }

  const totalUnits = stepped * count + remaining + base;
  const combinedSteps = resultSteps.reduce(combineSteps, []);

  return {
    units: weights.units,
    totalKg: unitsToKg(totalUnits, weights.units),
    base: base !== 0 ? base : undefined,
    steps: combinedSteps.length !== 0 ? combinedSteps : undefined,
    additional: remaining !== 0 ? remaining : undefined,
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

export function autoDetectWeights(
  weights: PerformanceWeights | undefined,
  previousKg: number | undefined,
  currentKg: number | undefined,
): PerformanceWeights {
  if (
    currentKg === undefined ||
    previousKg === undefined ||
    currentKg <= previousKg ||
    (weights && !weights.auto)
  ) {
    return weights ?? DEFAULT_AUTO_WEIGHTS;
  }

  const units = weights?.units ?? DEFAULT_WEIGHT_UNITS;
  const previousUnits = kgToUnits(previousKg, units);
  const currentUnits = kgToUnits(currentKg, units);
  const steps = currentUnits - previousUnits;
  const base = currentUnits - Math.floor(currentUnits / steps) * steps;

  return {
    auto: true,
    units,
    base,
    steps,
  };
}

export function switchUnits(units: WeightUnits): WeightUnits {
  switch (units) {
    case "kg":
      return "lbs";

    case "lbs":
      return "kg";
  }
}
