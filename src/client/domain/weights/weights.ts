import {
  DEFAULT_WEIGHT_UNITS,
  type WeightUnits,
  DEFAULT_EXERCISE_WEIGHT,
  type ExerciseWeight,
} from "../../db";

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
