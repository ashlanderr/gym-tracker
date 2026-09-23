import { volumeToOneRepMax } from "../../domain";
import type { DemoLift, LiftLevel } from "./types.ts";

// Pullups count the whole load, body weight included: one number that grows,
// the same kind for every lift.
export function liftLevel(
  { anchor, best, thresholds }: DemoLift,
  bodyWeight: number,
): LiftLevel | null {
  if (!best) return null;
  const load = best.weight + (anchor === "pullup" ? bodyWeight : 0);
  const oneRepMax = volumeToOneRepMax(load, best.reps);

  const starts = [0, ...thresholds];
  const index = starts.filter((start) => oneRepMax >= start).length - 1;
  const next = starts[index + 1];
  if (next === undefined) {
    return { index, progress: 1, oneRepMax, toNext: null };
  }
  return {
    index,
    progress: (oneRepMax - starts[index]) / (next - starts[index]),
    oneRepMax,
    toNext: next - oneRepMax,
  };
}

// Half a kilogram is as fine as a plate pair goes; the gap rounds up so it
// never reads zero while a level is still ahead.
export function formatKg(value: number, round: "nearest" | "up" = "nearest") {
  const halves = round === "up" ? Math.ceil(value * 2) : Math.round(value * 2);
  return `${(halves / 2).toLocaleString("ru")} кг`;
}
