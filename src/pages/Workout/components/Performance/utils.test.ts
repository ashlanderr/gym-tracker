import { buildRecommendations } from "./utils.ts";

test("no sets", () => {
  const rec = buildRecommendations([], []);
  expect(rec).toEqual([]);
});

test("no previous sets", () => {
  const rec = buildRecommendations(
    [],
    [
      { type: "warm-up", weight: 0, reps: 0 },
      { type: "warm-up", weight: 10, reps: 0 },
      { type: "warm-up", weight: 0, reps: 0 },
      { type: "warm-up", weight: 0, reps: 30 },
      { type: "warm-up", weight: 0, reps: 0 },
      { type: "working", weight: 0, reps: 0 },
      { type: "working", weight: 30, reps: 8 },
      { type: "working", weight: 0, reps: 0 },
      { type: "working", weight: 0, reps: 9 },
      { type: "working", weight: 0, reps: 0 },
      { type: "working", weight: 35, reps: 10 },
      { type: "working", weight: 0, reps: 0 },
    ],
  );
  expect(rec).toEqual([
    { type: "warm-up", weight: 0, reps: 0 },
    { type: "warm-up", weight: 10, reps: 0 },
    { type: "warm-up", weight: 10, reps: 0 },
    { type: "warm-up", weight: 10, reps: 30 },
    { type: "warm-up", weight: 10, reps: 30 },
    { type: "working", weight: 0, reps: 0 },
    { type: "working", weight: 30, reps: 8 },
    { type: "working", weight: 30, reps: 8 },
    { type: "working", weight: 30, reps: 9 },
    { type: "working", weight: 30, reps: 9 },
    { type: "working", weight: 35, reps: 10 },
    { type: "working", weight: 35, reps: 10 },
  ]);
});

test("empty current sets, increase reps", () => {
  const rec = buildRecommendations(
    [
      { type: "warm-up", weight: 10, reps: 30 },
      { type: "warm-up", weight: 15, reps: 12 },
      { type: "working", weight: 30, reps: 8 },
      { type: "working", weight: 30, reps: 8 },
      { type: "working", weight: 30, reps: 8 },
      { type: "working", weight: 30, reps: 8 },
    ],
    [
      { type: "warm-up", weight: 10, reps: 30 },
      { type: "warm-up", weight: 15, reps: 12 },
      { type: "working", weight: 0, reps: 0 },
      { type: "working", weight: 0, reps: 0 },
      { type: "working", weight: 0, reps: 0 },
      { type: "working", weight: 0, reps: 0 },
    ],
  );
  expect(rec).toEqual([
    { type: "warm-up", weight: 10, reps: 30 },
    { type: "warm-up", weight: 15, reps: 12 },
    { type: "working", weight: 30, reps: 10 },
    { type: "working", weight: 30, reps: 10 },
    { type: "working", weight: 30, reps: 10 },
    { type: "working", weight: 30, reps: 10 },
  ]);
});

test("empty current sets, increase weight", () => {
  const rec = buildRecommendations(
    [
      { type: "warm-up", weight: 10, reps: 30 },
      { type: "warm-up", weight: 15, reps: 12 },
      { type: "working", weight: 30, reps: 12 },
      { type: "working", weight: 30, reps: 12 },
      { type: "working", weight: 30, reps: 12 },
      { type: "working", weight: 30, reps: 12 },
    ],
    [
      { type: "warm-up", weight: 10, reps: 30 },
      { type: "warm-up", weight: 15, reps: 12 },
      { type: "working", weight: 0, reps: 0 },
      { type: "working", weight: 0, reps: 0 },
      { type: "working", weight: 0, reps: 0 },
      { type: "working", weight: 0, reps: 0 },
    ],
  );
  expect(rec).toEqual([
    { type: "warm-up", weight: 10, reps: 30 },
    { type: "warm-up", weight: 15, reps: 12 },
    { type: "working", weight: 33, reps: 8 },
    { type: "working", weight: 33, reps: 8 },
    { type: "working", weight: 33, reps: 8 },
    { type: "working", weight: 33, reps: 8 },
  ]);
});

test("single current weight filled, same weight, increase reps", () => {
  const rec = buildRecommendations(
    [
      { type: "warm-up", weight: 10, reps: 30 },
      { type: "warm-up", weight: 15, reps: 12 },
      { type: "working", weight: 30, reps: 12 },
      { type: "working", weight: 30, reps: 12 },
      { type: "working", weight: 30, reps: 12 },
      { type: "working", weight: 30, reps: 12 },
    ],
    [
      { type: "warm-up", weight: 10, reps: 30 },
      { type: "warm-up", weight: 15, reps: 12 },
      { type: "working", weight: 30, reps: 0 },
      { type: "working", weight: 0, reps: 0 },
      { type: "working", weight: 0, reps: 0 },
      { type: "working", weight: 0, reps: 0 },
    ],
  );
  expect(rec).toEqual([
    { type: "warm-up", weight: 10, reps: 30 },
    { type: "warm-up", weight: 15, reps: 12 },
    { type: "working", weight: 30, reps: 15 },
    { type: "working", weight: 30, reps: 15 },
    { type: "working", weight: 30, reps: 15 },
    { type: "working", weight: 30, reps: 15 },
  ]);
});

test("single current weight filled, adjusted weight, adjust reps", () => {
  const rec = buildRecommendations(
    [
      { type: "warm-up", weight: 10, reps: 30 },
      { type: "warm-up", weight: 15, reps: 12 },
      { type: "working", weight: 30, reps: 12 },
      { type: "working", weight: 30, reps: 12 },
      { type: "working", weight: 30, reps: 12 },
      { type: "working", weight: 30, reps: 12 },
    ],
    [
      { type: "warm-up", weight: 10, reps: 30 },
      { type: "warm-up", weight: 15, reps: 12 },
      { type: "working", weight: 35, reps: 0 },
      { type: "working", weight: 0, reps: 0 },
      { type: "working", weight: 0, reps: 0 },
      { type: "working", weight: 0, reps: 0 },
    ],
  );
  expect(rec).toEqual([
    { type: "warm-up", weight: 10, reps: 30 },
    { type: "warm-up", weight: 15, reps: 12 },
    { type: "working", weight: 35, reps: 6 },
    { type: "working", weight: 35, reps: 6 },
    { type: "working", weight: 35, reps: 6 },
    { type: "working", weight: 35, reps: 6 },
  ]);
});

test("empty current sets, small weight, increase reps", () => {
  const rec = buildRecommendations(
    [
      { type: "working", weight: 4, reps: 12 },
      { type: "working", weight: 4, reps: 12 },
      { type: "working", weight: 4, reps: 12 },
      { type: "working", weight: 4, reps: 12 },
    ],
    [
      { type: "working", weight: 0, reps: 0 },
      { type: "working", weight: 0, reps: 0 },
      { type: "working", weight: 0, reps: 0 },
      { type: "working", weight: 0, reps: 0 },
    ],
  );
  expect(rec).toEqual([
    { type: "working", weight: 4, reps: 15 },
    { type: "working", weight: 4, reps: 15 },
    { type: "working", weight: 4, reps: 15 },
    { type: "working", weight: 4, reps: 15 },
  ]);
});

test("empty current sets, more current working sets", () => {
  const rec = buildRecommendations(
    [
      { type: "warm-up", weight: 10, reps: 30 },
      { type: "working", weight: 40, reps: 8 },
      { type: "working", weight: 40, reps: 8 },
      { type: "working", weight: 40, reps: 8 },
      { type: "working", weight: 40, reps: 8 },
    ],
    [
      { type: "warm-up", weight: 10, reps: 30 },
      { type: "working", weight: 0, reps: 0 },
      { type: "working", weight: 0, reps: 0 },
      { type: "working", weight: 0, reps: 0 },
      { type: "working", weight: 0, reps: 0 },
      { type: "working", weight: 0, reps: 0 },
    ],
  );
  expect(rec).toEqual([
    { type: "warm-up", weight: 10, reps: 30 },
    { type: "working", weight: 40, reps: 10 },
    { type: "working", weight: 40, reps: 10 },
    { type: "working", weight: 40, reps: 10 },
    { type: "working", weight: 40, reps: 10 },
    { type: "working", weight: 40, reps: 10 },
  ]);
});

test("empty current sets, less current working sets", () => {
  const rec = buildRecommendations(
    [
      { type: "warm-up", weight: 10, reps: 30 },
      { type: "working", weight: 40, reps: 8 },
      { type: "working", weight: 40, reps: 8 },
      { type: "working", weight: 40, reps: 8 },
      { type: "working", weight: 40, reps: 8 },
    ],
    [
      { type: "warm-up", weight: 10, reps: 30 },
      { type: "working", weight: 0, reps: 0 },
      { type: "working", weight: 0, reps: 0 },
      { type: "working", weight: 0, reps: 0 },
    ],
  );
  expect(rec).toEqual([
    { type: "warm-up", weight: 10, reps: 30 },
    { type: "working", weight: 40, reps: 10 },
    { type: "working", weight: 40, reps: 10 },
    { type: "working", weight: 40, reps: 10 },
  ]);
});

test("empty current sets, less current warm up sets", () => {
  const rec = buildRecommendations(
    [
      { type: "warm-up", weight: 10, reps: 30 },
      { type: "warm-up", weight: 10, reps: 30 },
      { type: "working", weight: 40, reps: 8 },
      { type: "working", weight: 40, reps: 8 },
    ],
    [
      { type: "warm-up", weight: 10, reps: 30 },
      { type: "working", weight: 0, reps: 0 },
      { type: "working", weight: 0, reps: 0 },
    ],
  );
  expect(rec).toEqual([
    { type: "warm-up", weight: 10, reps: 30 },
    { type: "working", weight: 40, reps: 10 },
    { type: "working", weight: 40, reps: 10 },
  ]);
});

test("smaller weights in current sets", () => {
  const rec = buildRecommendations(
    [
      { type: "working", weight: 40, reps: 8 },
      { type: "working", weight: 40, reps: 8 },
      { type: "working", weight: 40, reps: 8 },
      { type: "working", weight: 40, reps: 8 },
    ],
    [
      { type: "working", weight: 30, reps: 12 },
      { type: "working", weight: 35, reps: 12 },
      { type: "working", weight: 0, reps: 0 },
      { type: "working", weight: 30, reps: 12 },
      { type: "working", weight: 30, reps: 0 },
      { type: "working", weight: 0, reps: 0 },
    ],
  );
  expect(rec).toEqual([
    { type: "working", weight: 30, reps: 12 },
    { type: "working", weight: 35, reps: 12 },
    { type: "working", weight: 35, reps: 12 },
    { type: "working", weight: 30, reps: 12 },
    { type: "working", weight: 30, reps: 12 },
    { type: "working", weight: 30, reps: 12 },
  ]);
});

test("empty current warm up sets, fill warm up sets", () => {
  const rec = buildRecommendations(
    [
      { type: "warm-up", weight: 10, reps: 30 },
      { type: "warm-up", weight: 15, reps: 12 },
      { type: "working", weight: 30, reps: 8 },
    ],
    [
      { type: "warm-up", weight: 0, reps: 0 },
      { type: "warm-up", weight: 0, reps: 0 },
      { type: "warm-up", weight: 0, reps: 0 },
      { type: "working", weight: 0, reps: 0 },
    ],
  );
  expect(rec).toEqual([
    { type: "warm-up", weight: 15, reps: 30 },
    { type: "warm-up", weight: 21, reps: 12 },
    { type: "warm-up", weight: 21, reps: 12 },
    { type: "working", weight: 30, reps: 10 },
  ]);
});

test("partial current warm up sets, fill warm up sets", () => {
  const rec = buildRecommendations(
    [
      { type: "warm-up", weight: 10, reps: 30 },
      { type: "warm-up", weight: 15, reps: 12 },
      { type: "working", weight: 30, reps: 8 },
    ],
    [
      { type: "warm-up", weight: 10, reps: 30 },
      { type: "warm-up", weight: 0, reps: 0 },
      { type: "warm-up", weight: 0, reps: 0 },
      { type: "working", weight: 0, reps: 0 },
    ],
  );
  expect(rec).toEqual([
    { type: "warm-up", weight: 10, reps: 30 },
    { type: "warm-up", weight: 21, reps: 12 },
    { type: "warm-up", weight: 21, reps: 12 },
    { type: "working", weight: 30, reps: 10 },
  ]);
});

test("weight adjusted in current warm up sets, adjust warm up reps", () => {
  const rec = buildRecommendations(
    [
      { type: "warm-up", weight: 10, reps: 30 },
      { type: "warm-up", weight: 15, reps: 12 },
      { type: "working", weight: 30, reps: 8 },
    ],
    [
      { type: "warm-up", weight: 16, reps: 0 },
      { type: "warm-up", weight: 20, reps: 0 },
      { type: "working", weight: 30, reps: 10 },
    ],
  );
  expect(rec).toEqual([
    { type: "warm-up", weight: 16, reps: 27 },
    { type: "warm-up", weight: 20, reps: 15 },
    { type: "working", weight: 30, reps: 10 },
  ]);
});

test("reps adjusted in current warm up sets, adjust warm up weight", () => {
  const rec = buildRecommendations(
    [
      { type: "warm-up", weight: 10, reps: 30 },
      { type: "warm-up", weight: 15, reps: 12 },
      { type: "working", weight: 30, reps: 8 },
    ],
    [
      { type: "warm-up", weight: 0, reps: 20 },
      { type: "warm-up", weight: 0, reps: 10 },
      { type: "working", weight: 30, reps: 10 },
    ],
  );
  expect(rec).toEqual([
    { type: "warm-up", weight: 18, reps: 20 },
    { type: "warm-up", weight: 22, reps: 10 },
    { type: "working", weight: 30, reps: 10 },
  ]);
});
