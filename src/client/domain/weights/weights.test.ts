import {
  computeWeights,
  oneRepMaxToReps,
  oneRepMaxToWeight,
  snapWeightKg,
  unitsToKg,
  volumeToOneRepMax,
} from "./weights.ts";
import type { PerformanceWeights } from "../../db";
import type { WeightsConstructor } from "./types.ts";

test("round plate weights", () => {
  const plateWeights: PerformanceWeights = {
    units: "kg",
    steps: [5, 10, 20],
    count: 1,
  };

  const data = [
    {
      weight: 10,
      plates: [
        //
        { weight: 10, count: 1 },
      ],
    },
    {
      weight: 12,
      plates: [
        //
        { weight: 10, count: 1 },
      ],
    },
    {
      weight: 13,
      plates: [
        //
        { weight: 10, count: 1 },
        { weight: 5, count: 1 },
      ],
    },
    {
      weight: 15,
      plates: [
        //
        { weight: 10, count: 1 },
        { weight: 5, count: 1 },
      ],
    },
    {
      weight: 17,
      plates: [
        //
        { weight: 10, count: 1 },
        { weight: 5, count: 1 },
      ],
    },
    {
      weight: 19,
      plates: [
        //
        { weight: 20, count: 1 },
      ],
    },
  ];

  for (const { weight, plates } of data) {
    const result = computeWeights(plateWeights, weight);
    expect(result.steps).toEqual(plates);
  }
});

test("round machine weights", () => {
  const machineWeights: PerformanceWeights = {
    units: "kg",
    base: 0,
    steps: 5,
  };

  expect(snapWeightKg(machineWeights, 10)).toEqual(10);
  expect(snapWeightKg(machineWeights, 12)).toEqual(10);
  expect(snapWeightKg(machineWeights, 14)).toEqual(15);
  expect(snapWeightKg(machineWeights, 17)).toEqual(15);
  expect(snapWeightKg(machineWeights, 19)).toEqual(20);
});

test("round machine weights with additional weight 1", () => {
  const machineWeights: PerformanceWeights = {
    units: "lbs",
    base: 10,
    steps: 15,
    additional: 5,
  };

  const weightKg = unitsToKg(110, "lbs");
  const actual = computeWeights(machineWeights, weightKg);

  const expected: WeightsConstructor = {
    units: "lbs",
    base: 10,
    steps: [
      { weight: 15, count: 6 },
      { weight: 5, count: 2 },
    ],
    count: 1,
    totalUnits: 110,
    totalKg: weightKg,
  };

  expect(actual).toEqual(expected);
});

test("round machine weights with additional weight 2", () => {
  const machineWeights: PerformanceWeights = {
    units: "lbs",
    base: 10,
    steps: [5, 15],
  };

  const weightKg = unitsToKg(114, "lbs");
  const roundedKg = unitsToKg(115, "lbs");
  const actual = computeWeights(machineWeights, weightKg);

  const expected: WeightsConstructor = {
    units: "lbs",
    base: 10,
    steps: [{ weight: 15, count: 7 }],
    count: 1,
    totalUnits: 115,
    totalKg: roundedKg,
  };

  expect(actual).toEqual(expected);
});

test("one rep max equivalents", () => {
  expect(oneRepMaxToWeight(volumeToOneRepMax(60, 6), 6)).closeTo(60, 0.1);
  expect(oneRepMaxToWeight(volumeToOneRepMax(60, 3), 3)).closeTo(60, 0.1);
  expect(oneRepMaxToWeight(volumeToOneRepMax(60, 12), 12)).closeTo(60, 0.1);
  expect(oneRepMaxToWeight(volumeToOneRepMax(60, 30), 30)).closeTo(60, 0.1);

  expect(oneRepMaxToReps(volumeToOneRepMax(60, 6), 60)).closeTo(6, 0.1);
  expect(oneRepMaxToReps(volumeToOneRepMax(60, 3), 60)).closeTo(3, 0.1);
  expect(oneRepMaxToReps(volumeToOneRepMax(60, 12), 60)).closeTo(12, 0.1);
  expect(oneRepMaxToReps(volumeToOneRepMax(60, 30), 60)).closeTo(30, 0.1);
});
