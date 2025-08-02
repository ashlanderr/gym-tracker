import type { SetData, WorkingVolume } from "./types.ts";
import {
  DEFAULT_RANGE_MAX_REPS,
  DEFAULT_RANGE_MIN_REPS,
  REPS_INCREASE_WEIGHT_MULTIPLIER,
  WARM_UP_WEIGHT_MULTIPLIER,
} from "./constants.ts";
import {
  oneRepMaxToReps,
  oneRepMaxToWeight,
  volumeToOneRepMax,
} from "../utils.ts";

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

function increaseReps(oneRepMax: number, weight: number): number {
  const newRepMax = oneRepMax * REPS_INCREASE_WEIGHT_MULTIPLIER;
  return Math.round(oneRepMaxToReps(newRepMax, weight));
}

export function buildRecommendations(
  prevSets: SetData[],
  currentSets: SetData[],
): SetData[] {
  const prevWarmUpSets = prevSets.filter((s) => s.type === "warm-up");
  const prevWorkingSets = prevSets.filter((s) => s.type === "working");
  const working = findWorkingVolume(prevWorkingSets);
  const result: SetData[] = [];
  let warmUpIndex = 0;
  let filledSet: SetData | undefined = undefined;

  for (const set of currentSets) {
    switch (set.type) {
      case "warm-up": {
        let weight = 0;
        let reps = 0;

        const prevSet = prevWarmUpSets.at(warmUpIndex);
        const warmUpMax = working
          ? working.oneRepMax * WARM_UP_WEIGHT_MULTIPLIER
          : undefined;

        if (set.weight && set.reps) {
          weight = set.weight;
          reps = set.reps;
        } else if (warmUpMax && prevSet && !set.weight && !set.reps) {
          reps = prevSet.reps;
          weight = Math.round(oneRepMaxToWeight(warmUpMax, reps));
        } else if (warmUpMax && !set.weight && set.reps) {
          reps = set.reps;
          weight = Math.round(oneRepMaxToWeight(warmUpMax, reps));
        } else if (warmUpMax && set.weight && !set.reps) {
          weight = set.weight;
          reps = Math.round(oneRepMaxToReps(warmUpMax, weight));
        } else {
          weight = set.weight;
          reps = set.reps;
        }

        result.push({
          type: "warm-up",
          weight,
          reps,
        });
        warmUpIndex += 1;
        break;
      }

      case "working": {
        let weight = 0;
        let reps = 0;

        if (set.weight && set.reps) {
          weight = set.weight;
          reps = set.reps;
        } else if (filledSet && !set.weight && !set.reps) {
          weight = filledSet.weight;
          reps = filledSet.reps;
        } else if (working && !set.weight && !set.reps) {
          if (working.reps >= DEFAULT_RANGE_MAX_REPS) {
            reps = DEFAULT_RANGE_MIN_REPS;
            weight = Math.round(oneRepMaxToWeight(working.oneRepMax, reps));
            if (weight <= working.weight) {
              weight = working.weight;
              reps = increaseReps(working.oneRepMax, weight);
            }
          } else {
            weight = working.weight;
            reps = increaseReps(working.oneRepMax, weight);
          }
        } else if (working && set.weight && !set.reps) {
          if (set.weight === working.weight) {
            weight = set.weight;
            reps = increaseReps(working.oneRepMax, weight);
          } else {
            weight = set.weight;
            reps = Math.round(oneRepMaxToReps(working.oneRepMax, weight));
          }
        } else if (working && !set.weight && set.reps) {
          reps = set.reps;
          weight = Math.round(oneRepMaxToWeight(working.oneRepMax, reps));
        } else {
          weight = set.weight;
          reps = set.reps;
        }

        filledSet = {
          type: "working",
          weight,
          reps,
        };
        result.push(filledSet);
        break;
      }
    }
  }

  return result;
}
