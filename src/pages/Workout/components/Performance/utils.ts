import type { SetData, WorkingVolume } from "./types.ts";
import {
  DEFAULT_RANGE_MAX_REPS,
  DEFAULT_RANGE_MIN_REPS,
  REPS_INCREASE_WEIGHT_MULTIPLIER,
  WARM_UP_DEFAULT_REPS,
  WARM_UP_WEIGHT_MULTIPLIER,
} from "./constants.ts";

function findWorkingVolume(workingSets: SetData[]): WorkingVolume | undefined {
  if (workingSets.length === 0) return undefined;

  let workingWeight = Infinity;
  let workingReps = Infinity;

  for (const set of workingSets) {
    if (!workingWeight || set.weight < workingWeight) {
      workingWeight = set.weight;
      workingReps = set.reps;
    } else if (set.weight === workingWeight) {
      workingReps = Math.min(workingReps ?? set.reps, set.reps);
    }
  }

  return {
    weight: workingWeight,
    reps: workingReps,
    oneRepMax: volumeToOneRepMax(workingWeight, workingReps),
  };
}

function computeWarmUpWeight(oneRepMax: number, reps: number): number {
  const warmUpMax = oneRepMax * WARM_UP_WEIGHT_MULTIPLIER;
  const weight = oneRepMaxToWeight(warmUpMax, reps);
  return Math.floor(weight);
}

function computeWarmUpReps(oneRepMax: number, weight: number): number {
  const warmUpMax = oneRepMax * WARM_UP_WEIGHT_MULTIPLIER;
  const reps = oneRepMaxToReps(warmUpMax, weight);
  return Math.floor(reps);
}

function buildWarmUpRecommendation(
  working: WorkingVolume | undefined,
  current: SetData,
  filled: SetData,
  index: number,
): SetData {
  let weight = current.weight;
  let reps = current.reps;

  if (working) {
    if (!reps && weight) {
      reps = computeWarmUpReps(working.oneRepMax, weight);
    } else if (reps && !weight) {
      weight = computeWarmUpWeight(working.oneRepMax, reps);
    } else if (!reps && !weight) {
      const repsIndex = Math.min(index, WARM_UP_DEFAULT_REPS.length - 1);
      reps = WARM_UP_DEFAULT_REPS[repsIndex];
      weight = computeWarmUpWeight(working.oneRepMax, reps);
    }
  } else {
    weight = filled.weight;
    reps = filled.reps;
  }

  return {
    type: "warm-up",
    weight,
    reps,
  };
}

function buildWorkingRecommendation(
  working: WorkingVolume | undefined,
  filled: SetData,
): SetData {
  let weight = filled.weight;
  let reps = filled.reps;

  if (working && !weight && working.reps >= DEFAULT_RANGE_MAX_REPS) {
    reps = DEFAULT_RANGE_MIN_REPS;
    weight = Math.floor(oneRepMaxToWeight(working.oneRepMax, reps));
  }

  if (working && !weight) {
    weight = working.weight;
  }

  if (working && weight === working.weight) {
    const newRepMax = working.oneRepMax * REPS_INCREASE_WEIGHT_MULTIPLIER;
    reps = Math.ceil(oneRepMaxToReps(newRepMax, weight));
  }

  if (working && weight > working.weight && !reps) {
    reps = Math.ceil(oneRepMaxToReps(working.oneRepMax, weight));
  }

  return {
    type: "working",
    weight,
    reps,
  };
}

export function buildRecommendations(
  prevSets: SetData[],
  currentSets: SetData[],
): SetData[] {
  const prevWorkingSets = prevSets.filter((s) => s.type === "working");
  const working = findWorkingVolume(prevWorkingSets);
  const result: SetData[] = [];
  const filled: SetData = { type: "warm-up", weight: 0, reps: 0 };
  let warmUpIndex = 0;

  for (const currentSet of currentSets) {
    if (filled.type !== currentSet.type) {
      filled.type = currentSet.type;
      filled.weight = 0;
      filled.reps = 0;
    }

    filled.weight = currentSet.weight || filled.weight;
    filled.reps = currentSet.reps || filled.reps;

    switch (currentSet.type) {
      case "warm-up": {
        const set = buildWarmUpRecommendation(
          working,
          currentSet,
          filled,
          warmUpIndex,
        );
        result.push(set);
        warmUpIndex += 1;
        break;
      }

      case "working": {
        const set = buildWorkingRecommendation(working, filled);
        result.push(set);
        break;
      }
    }
  }

  return result;
}

function volumeToOneRepMax(weight: number, reps: number): number {
  return weight * (1 + reps / 30);
}

function oneRepMaxToWeight(oneRepMax: number, reps: number): number {
  return oneRepMax / (1 + reps / 30);
}

function oneRepMaxToReps(oneRepMax: number, weight: number): number {
  return (oneRepMax / weight - 1) * 30;
}
