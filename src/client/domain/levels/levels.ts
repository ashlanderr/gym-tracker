import type { AnchorId, Sex } from "../../db";
import { STANDARDS, type StandardRow } from "./standards.ts";

// Novice, Intermediate, Advanced, Elite.
export type StrengthLevel = 0 | 1 | 2 | 3;

export interface StrengthLevelInput {
  anchor: AnchorId;
  sex: Sex;
  bodyWeight: number;
  // Pullups count the whole load, body weight included.
  oneRepMax: number;
}

export interface StrengthLevelResult {
  level: StrengthLevel;
  // Share of the way from this level to the next one, 1 at the top.
  progress: number;
  // Kilograms of one-rep max left to the next level, none at the top.
  toNext: number | null;
}

export function computeStrengthLevel({
  anchor,
  sex,
  bodyWeight,
  oneRepMax,
}: StrengthLevelInput): StrengthLevelResult {
  const offset = anchor === "pullup" ? bodyWeight : 0;
  const [, ...thresholds] = interpolateRow(STANDARDS[anchor][sex], bodyWeight);
  const starts = [0, ...thresholds.map((t) => t + offset)];

  const level = (starts.filter((start) => oneRepMax >= start).length -
    1) as StrengthLevel;
  const next = starts[level + 1];
  if (next === undefined) return { level, progress: 1, toNext: null };

  const start = starts[level];
  return {
    level,
    progress: Math.max(0, (oneRepMax - start) / (next - start)),
    toNext: next - oneRepMax,
  };
}

// Straight lines between the printed body weights, the edge rows past them.
function interpolateRow(rows: StandardRow[], bodyWeight: number): StandardRow {
  const first = rows[0];
  const last = rows[rows.length - 1];
  if (bodyWeight <= first[0]) return first;
  if (bodyWeight >= last[0]) return last;

  const upper = rows.findIndex((row) => row[0] > bodyWeight);
  const a = rows[upper - 1];
  const b = rows[upper];
  const t = (bodyWeight - a[0]) / (b[0] - a[0]);
  return a.map((value, i) => value + (b[i] - value) * t) as StandardRow;
}
