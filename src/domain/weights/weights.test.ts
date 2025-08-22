import {
  autoDetectWeights,
  computeWeights,
  snapWeightKg,
  unitsToKg,
} from "./weights.ts";
import type { PerformanceWeights } from "../../db";
import type { WeightsConstructor } from "./types.ts";

function testAutoDetect({
  weights,
  previousKg,
  currentKg,
  detected,
}: {
  weights: PerformanceWeights | undefined;
  previousKg: number | undefined;
  currentKg: number | undefined;
  detected: PerformanceWeights;
}) {
  const result = autoDetectWeights(weights, previousKg, currentKg);
  expect(result).toEqual(detected);
}

test("empty state -> default weights", () => {
  testAutoDetect({
    weights: undefined,
    previousKg: undefined,
    currentKg: undefined,
    detected: {
      units: "kg",
      auto: true,
      steps: 1,
      base: 0,
    },
  });
});

test("weights empty, previous empty, current filled -> default weights", () => {
  testAutoDetect({
    weights: undefined,
    previousKg: undefined,
    currentKg: 10,
    detected: {
      units: "kg",
      auto: true,
      base: 0,
      steps: 1,
    },
  });
});

test("weights filled, previous empty, current filled -> old weights", () => {
  testAutoDetect({
    weights: {
      units: "lbs",
      auto: true,
      base: 10,
      steps: 10,
    },
    previousKg: undefined,
    currentKg: 22,
    detected: {
      units: "lbs",
      auto: true,
      base: 10,
      steps: 10,
    },
  });
});

test("weights empty, current greater than previous -> new increment", () => {
  testAutoDetect({
    weights: undefined,
    previousKg: 10,
    currentKg: 15,
    detected: {
      units: "kg",
      auto: true,
      base: 0,
      steps: 5,
    },
  });
});

test("weights filled in kg, current greater than previous -> new increment in kg", () => {
  testAutoDetect({
    weights: {
      units: "kg",
      auto: true,
      base: 0,
      steps: 5,
    },
    previousKg: 25,
    currentKg: 40,
    detected: {
      units: "kg",
      auto: true,
      base: 10,
      steps: 15,
    },
  });
});

test("weights filled in lbs, current greater than previous -> new increment in lbs", () => {
  testAutoDetect({
    weights: {
      units: "lbs",
      auto: true,
      base: 0,
      steps: 5,
    },
    previousKg: unitsToKg(10, "lbs"),
    currentKg: unitsToKg(25, "lbs"),
    detected: {
      units: "lbs",
      auto: true,
      base: 10,
      steps: 15,
    },
  });
});

test("weights empty, current less than previous -> default weights", () => {
  testAutoDetect({
    weights: undefined,
    previousKg: 15,
    currentKg: 10,
    detected: {
      units: "kg",
      auto: true,
      base: 0,
      steps: 1,
    },
  });
});

test("weights filled, current less than previous -> old weights", () => {
  testAutoDetect({
    weights: {
      units: "kg",
      auto: true,
      base: 0,
      steps: 2,
    },
    previousKg: 15,
    currentKg: 10,
    detected: {
      units: "kg",
      auto: true,
      base: 0,
      steps: 2,
    },
  });
});

test("weights filled, current empty -> old weights", () => {
  testAutoDetect({
    weights: {
      units: "lbs",
      auto: true,
      base: 0,
      steps: 5,
    },
    previousKg: 20,
    currentKg: undefined,
    detected: {
      units: "lbs",
      auto: true,
      base: 0,
      steps: 5,
    },
  });
});

test("weights filled, current equal previous -> same weights", () => {
  testAutoDetect({
    weights: {
      units: "lbs",
      auto: true,
      steps: 10,
      base: 5,
    },
    previousKg: unitsToKg(25, "lbs"),
    currentKg: unitsToKg(25, "lbs"),
    detected: {
      units: "lbs",
      auto: true,
      steps: 10,
      base: 5,
    },
  });
});

test("auto = undefined, current greater than previous -> same weights", () => {
  testAutoDetect({
    weights: {
      units: "lbs",
      steps: 15,
      base: 10,
      additional: 5,
    },
    previousKg: unitsToKg(25, "lbs"),
    currentKg: unitsToKg(35, "lbs"),
    detected: {
      units: "lbs",
      steps: 15,
      base: 10,
      additional: 5,
    },
  });
});

test("auto = false, current greater than previous -> same weights", () => {
  testAutoDetect({
    weights: {
      units: "lbs",
      auto: false,
      steps: 15,
      base: 10,
      additional: 5,
    },
    previousKg: unitsToKg(25, "lbs"),
    currentKg: unitsToKg(35, "lbs"),
    detected: {
      units: "lbs",
      auto: false,
      steps: 15,
      base: 10,
      additional: 5,
    },
  });
});

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
