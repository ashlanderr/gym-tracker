import {
  oneRepMaxToReps,
  oneRepMaxToWeight,
  volumeToOneRepMax,
} from "./weights.ts";
import { computeWeights, snapWeightKg, stepWeightKg } from "./constructor.ts";
import { EXERCISES } from "../../db/exercises/constants.ts";
import {
  defaultGym,
  type Exercise,
  type ExerciseLoad,
  type Gym,
} from "../../db";

const BENCH_PRESS = EXERCISES["bench_press"];

function exercise(load: ExerciseLoad): Exercise {
  return { ...BENCH_PRESS, load };
}

function gym(patch: Partial<Gym>): Gym {
  return { ...defaultGym("user"), ...patch };
}

test("barbell takes the heaviest bar that fits", () => {
  const barbell = exercise({ type: "barbell" });
  const plates = gym({
    bars: { units: "kg", items: [10, 20] },
    plates: { units: "kg", items: [20, 10, 5, 2.5] },
  });

  expect(computeWeights(barbell, plates, 15)).toEqual({
    type: "barbell",
    units: "kg",
    totalKg: 15,
    bar: 10,
    plates: [2.5],
  });

  expect(computeWeights(barbell, plates, 60)).toEqual({
    type: "barbell",
    units: "kg",
    totalKg: 60,
    bar: 20,
    plates: [20],
  });

  expect(snapWeightKg(barbell, plates, 8)).toEqual(10);
});

test("plates are assembled from any denominations", () => {
  const machine = exercise({ type: "plates", sides: 2 });
  const plates = gym({ plates: { units: "kg", items: [20, 15] } });

  expect(computeWeights(machine, plates, 60)).toMatchObject({
    totalKg: 60,
    plates: [15, 15],
  });
  expect(snapWeightKg(machine, plates, 68)).toEqual(70);
  expect(snapWeightKg(machine, plates, 68, "floor")).toEqual(60);
});

test("dumbbells are picked across sets", () => {
  const dumbbells = exercise({ type: "dumbbell", count: 2 });
  const sets = gym({
    dumbbells: [
      { units: "kg", min: 1, max: 10, step: 1 },
      { units: "kg", min: 12, max: 48, step: 2 },
    ],
  });

  expect(computeWeights(dumbbells, sets, 18)).toEqual({
    type: "dumbbell",
    units: "kg",
    totalKg: 18,
    dumbbell: 9,
    count: 2,
  });
  expect(snapWeightKg(dumbbells, sets, 23, "ceil")).toEqual(24);
  expect(snapWeightKg(dumbbells, sets, 200)).toEqual(96);
});

test("stack is configured per exercise", () => {
  const machine = exercise({ type: "stack" });
  const stack = gym({
    stacks: {
      [machine.id]: { units: "kg", base: 0, step: 10, additional: 2.5 },
    },
  });

  expect(computeWeights(machine, stack, 73)).toEqual({
    type: "stack",
    units: "kg",
    totalKg: 72.5,
    stack: 70,
    additional: 2.5,
  });
  expect(snapWeightKg(machine, stack, 77)).toEqual(77.5);
  expect(computeWeights(machine, gym({}), 73)).toBeNull();
});

test("fine adjustment covers every fraction of the main step", () => {
  const machine = exercise({ type: "stack" });
  const stack = gym({
    stacks: { [machine.id]: { units: "kg", base: 0, step: 20, additional: 5 } },
  });

  expect(computeWeights(machine, stack, 54)).toMatchObject({
    stack: 40,
    additional: 15,
  });
  expect(snapWeightKg(machine, stack, 59)).toEqual(60);
});

test("stack in pounds converts back to kilograms", () => {
  const machine = exercise({ type: "stack" });
  const stack = gym({
    stacks: { [machine.id]: { units: "lb", base: 10, step: 15 } },
  });

  const result = computeWeights(machine, stack, 114 * 0.454);
  expect(result).toMatchObject({ stack: 115, additional: 0 });
  expect(result?.totalKg).toBeCloseTo(115 * 0.454);
});

test("weight steps to the next assemblable value", () => {
  const barbell = exercise({ type: "barbell" });
  const plates = gym({
    bars: { units: "kg", items: [20] },
    plates: { units: "kg", items: [10, 2.5] },
  });

  expect(stepWeightKg(barbell, plates, 60, 1, 1)).toEqual(65);
  expect(stepWeightKg(barbell, plates, 60, -1, 1)).toEqual(55);
  expect(stepWeightKg(exercise({ type: "none" }), plates, 0, 1, 2.5)).toEqual(
    2.5,
  );
});

test("weight stays at the edge of the inventory", () => {
  const machine = exercise({ type: "stack" });
  const stack = gym({
    stacks: {
      [machine.id]: { units: "kg", base: 5, step: 5, additional: 2.5 },
    },
  });

  expect(stepWeightKg(machine, stack, 5, -1, 2.5)).toEqual(5);
  expect(stepWeightKg(machine, stack, 2.5, -1, 2.5)).toEqual(2.5);
  expect(stepWeightKg(machine, stack, 7.5, -1, 2.5)).toEqual(5);
  expect(stepWeightKg(machine, stack, 63, -1, 2.5)).toEqual(62.5);
  expect(stepWeightKg(machine, stack, 63, 1, 2.5)).toEqual(65);
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
