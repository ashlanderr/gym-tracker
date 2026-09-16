import {
  DEFAULT_WEIGHT_UNITS,
  type DumbbellSet,
  type Exercise,
  type Gym,
  type StackWeights,
  type WeightList,
  type WeightUnits,
} from "../../db";
import type { RoundingMode, WeightsConstructor } from "./types.ts";
import { kgToUnits, unitsToKg } from "./weights.ts";

const EPSILON = 1e-6;
const PRECISION = 100;

export function computeWeights(
  exercise: Exercise,
  gym: Gym,
  weightKg: number,
  rounding: RoundingMode = "round",
): WeightsConstructor | null {
  const { load } = exercise;

  switch (load.type) {
    case "none":
      return null;

    case "barbell":
      return barbellWeights(gym.bars, gym.plates, weightKg, rounding);

    case "plates":
      return platesWeights(gym.plates, load.sides, weightKg, rounding);

    case "dumbbell":
      return dumbbellWeights(gym.dumbbells, load.count, weightKg, rounding);

    case "stack": {
      const stack = gym.stacks[exercise.id];
      return stack ? stackWeights(stack, weightKg, rounding) : null;
    }
  }
}

export function snapWeightKg(
  exercise: Exercise,
  gym: Gym,
  weightKg: number,
  rounding: RoundingMode = "round",
): number {
  return computeWeights(exercise, gym, weightKg, rounding)?.totalKg ?? weightKg;
}

export function getWeightUnits(exercise: Exercise, gym: Gym): WeightUnits {
  switch (exercise.load.type) {
    case "none":
      return DEFAULT_WEIGHT_UNITS;

    case "barbell":
    case "plates":
      return gym.plates.units;

    case "dumbbell":
      return gym.dumbbells.at(0)?.units ?? DEFAULT_WEIGHT_UNITS;

    case "stack":
      return gym.stacks[exercise.id]?.units ?? DEFAULT_WEIGHT_UNITS;
  }
}

function barbellWeights(
  bars: WeightList,
  plates: WeightList,
  weightKg: number,
  rounding: RoundingMode,
): WeightsConstructor | null {
  const units = plates.units;
  const target = kgToUnits(weightKg, units);
  const barWeights = bars.items
    .map((bar) => roundPrecise(kgToUnits(unitsToKg(bar, bars.units), units)))
    .sort((a, b) => a - b);

  if (barWeights.length === 0) return null;

  const bar =
    [...barWeights].reverse().find((b) => b <= target + EPSILON) ??
    barWeights[0];
  const side = assemblePlates(plates.items, (target - bar) / 2, rounding);
  const total = bar + sum(side) * 2;

  return {
    type: "barbell",
    units,
    totalKg: unitsToKg(total, units),
    bar,
    plates: side,
  };
}

function platesWeights(
  plates: WeightList,
  sides: 1 | 2,
  weightKg: number,
  rounding: RoundingMode,
): WeightsConstructor {
  const units = plates.units;
  const target = kgToUnits(weightKg, units);
  const side = assemblePlates(plates.items, target / sides, rounding);
  const total = sum(side) * sides;

  return {
    type: "plates",
    units,
    totalKg: unitsToKg(total, units),
    sides,
    plates: side,
  };
}

function dumbbellWeights(
  sets: DumbbellSet[],
  count: 1 | 2,
  weightKg: number,
  rounding: RoundingMode,
): WeightsConstructor | null {
  const candidates = sets.flatMap((set) =>
    range(set.min, set.max, set.step).map((weight) => ({
      weight,
      units: set.units,
      kg: unitsToKg(weight, set.units),
    })),
  );

  const chosen = pickCandidate(
    candidates,
    (c) => c.kg,
    weightKg / count,
    rounding,
  );
  if (!chosen) return null;

  return {
    type: "dumbbell",
    units: chosen.units,
    totalKg: chosen.kg * count,
    dumbbell: chosen.weight,
    count,
  };
}

function stackWeights(
  stack: StackWeights,
  weightKg: number,
  rounding: RoundingMode,
): WeightsConstructor {
  const { units, base, step } = stack;
  const additional = stack.additional ?? 0;
  const target = kgToUnits(weightKg, units);
  const maxSteps =
    step > 0 ? Math.max(0, Math.ceil((target - base) / step) + 1) : 0;

  const candidates: Array<{ stack: number; additional: number }> = [];
  for (let i = 0; i <= maxSteps; ++i) {
    const weight = roundPrecise(base + i * step);
    candidates.push({ stack: weight, additional: 0 });
    if (additional > 0) candidates.push({ stack: weight, additional });
  }

  const chosen = pickCandidate(
    candidates,
    (c) => c.stack + c.additional,
    target,
    rounding,
  ) ?? { stack: base, additional: 0 };

  return {
    type: "stack",
    units,
    totalKg: unitsToKg(chosen.stack + chosen.additional, units),
    stack: chosen.stack,
    additional: chosen.additional,
  };
}

// Plates of any denomination are unlimited. Among the reachable sums the one
// matching the rounding mode is chosen, then assembled with the fewest plates.
function assemblePlates(
  denominations: number[],
  target: number,
  rounding: RoundingMode,
): number[] {
  const coins = [...new Set(denominations.map(toInt))].filter((c) => c > 0);
  if (coins.length === 0 || target <= EPSILON) return [];

  const unit = coins.reduce(gcd);
  const scaled = coins.map((c) => c / unit);
  const limit = Math.ceil(toInt(target) / unit) + Math.max(...scaled);

  const counts = new Array<number>(limit + 1).fill(Infinity);
  const lastCoin = new Array<number>(limit + 1).fill(0);
  counts[0] = 0;

  for (let sum = 1; sum <= limit; ++sum) {
    for (const coin of scaled) {
      if (coin <= sum && counts[sum - coin] + 1 < counts[sum]) {
        counts[sum] = counts[sum - coin] + 1;
        lastCoin[sum] = coin;
      }
    }
  }

  const reachable: number[] = [];
  counts.forEach((count, sum) => {
    if (count !== Infinity) reachable.push(sum);
  });

  const chosen =
    pickCandidate(reachable, (s) => fromInt(s * unit), target, rounding) ?? 0;

  const plates: number[] = [];
  for (let sum = chosen; sum > 0; sum -= lastCoin[sum]) {
    plates.push(fromInt(lastCoin[sum] * unit));
  }

  return plates.sort((a, b) => b - a);
}

function pickCandidate<T>(
  candidates: T[],
  value: (candidate: T) => number,
  target: number,
  rounding: RoundingMode,
): T | undefined {
  const sorted = [...candidates].sort((a, b) => value(a) - value(b));
  const below = [...sorted].reverse().find((c) => value(c) <= target + EPSILON);
  const above = sorted.find((c) => value(c) >= target - EPSILON);

  switch (rounding) {
    case "floor":
      return below ?? sorted.at(0);

    case "ceil":
      return above ?? sorted.at(-1);

    case "round":
      if (!below) return above;
      if (!above) return below;
      return target - value(below) < value(above) - target ? below : above;
  }
}

function range(min: number, max: number, step: number): number[] {
  if (step <= 0) return [min];
  const result: number[] = [];
  for (let i = 0; min + i * step <= max + EPSILON; ++i) {
    result.push(roundPrecise(min + i * step));
  }
  return result;
}

function sum(values: number[]): number {
  return roundPrecise(values.reduce((a, b) => a + b, 0));
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function toInt(value: number): number {
  return Math.round(value * PRECISION);
}

function fromInt(value: number): number {
  return value / PRECISION;
}

function roundPrecise(value: number): number {
  return fromInt(toInt(value));
}
