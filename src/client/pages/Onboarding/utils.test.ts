import { buildSteps, formatAnchorEntry, isStepId } from "./utils.ts";

test("a beginner is not asked about lifts", () => {
  expect(buildSteps("none")).toEqual([
    "welcome",
    "sex",
    "height",
    "weight",
    "experience",
    "done",
  ]);

  expect(buildSteps("current")).toEqual([
    "welcome",
    "sex",
    "height",
    "weight",
    "experience",
    "bench",
    "squat",
    "deadlift",
    "pullup",
    "done",
  ]);

  // Before the question is answered the longer path is the one promised, so
  // the progress bar loses a segment rather than growing one.
  expect(buildSteps(undefined)).toEqual(buildSteps("current"));
});

test("only a step of the flow is read back out of history", () => {
  // The step is kept in `location.state`, which a sheet takes over for as long
  // as it is open. Anything that is not a step means "stay where you are", so
  // every step has to be recognised whether or not it is on the current path.
  expect(isStepId("welcome")).toBe(true);
  expect(isStepId("bench")).toBe(true);
  expect(isStepId("jWZ4k1rQ")).toBe(false);
  expect(isStepId(null)).toBe(false);
});

test("a pullup with nothing on the belt is still an answer", () => {
  expect(formatAnchorEntry("pullup", { weightKg: 0, reps: 8 })).toBe(
    "свой вес × 8",
  );
  expect(formatAnchorEntry("pullup", { weightKg: 5, reps: 5 })).toBe(
    "+5 кг × 5",
  );
  // Help from the machine is the same scale below zero.
  expect(formatAnchorEntry("pullup", { weightKg: -17.5, reps: 8 })).toBe(
    "−17.5 кг × 8",
  );

  // Halves are worth showing; whole kilograms are not worth a trailing zero.
  expect(formatAnchorEntry("bench", { weightKg: 62.5, reps: 6 })).toBe(
    "62.5 кг × 6",
  );
  expect(formatAnchorEntry("squat", { weightKg: 60, reps: 6 })).toBe(
    "60 кг × 6",
  );
});
