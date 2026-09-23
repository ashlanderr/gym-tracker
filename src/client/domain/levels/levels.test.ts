import { computeStrengthLevel } from "./levels.ts";

test("a level starts exactly at its printed threshold", () => {
  // Intermediate bench for an 80 kg man is 98.
  const at = { anchor: "bench", sex: "male", bodyWeight: 80 } as const;
  expect(computeStrengthLevel({ ...at, oneRepMax: 97.5 }).level).toBe(0);
  expect(computeStrengthLevel({ ...at, oneRepMax: 98 })).toEqual({
    level: 1,
    progress: 0,
    toNext: 26,
  });
});

test("body weight between printed rows moves the threshold along", () => {
  // Halfway between 98 at 80 kg and 104 at 85 kg.
  const at = { anchor: "bench", sex: "male", bodyWeight: 82.5 } as const;
  expect(computeStrengthLevel({ ...at, oneRepMax: 100.5 }).level).toBe(0);
  expect(computeStrengthLevel({ ...at, oneRepMax: 101 }).level).toBe(1);
});

test("pullup thresholds count the body weight too", () => {
  // Intermediate is +33 on the belt at 80 kg, a whole load of 113.
  const at = { anchor: "pullup", sex: "male", bodyWeight: 80 } as const;
  expect(computeStrengthLevel({ ...at, oneRepMax: 112 }).level).toBe(0);
  expect(computeStrengthLevel({ ...at, oneRepMax: 113 }).level).toBe(1);
});

test("elite is the top with nothing left to reach", () => {
  expect(
    computeStrengthLevel({
      anchor: "squat",
      sex: "female",
      bodyWeight: 200,
      oneRepMax: 190,
    }),
  ).toEqual({ level: 3, progress: 1, toNext: null });
});
