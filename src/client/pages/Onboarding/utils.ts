import { ANCHOR_IDS } from "./constants.ts";
import type { AnchorEntry, AnchorId, Experience, StepId } from "./types.ts";

export function formatNumber(value: number, decimals = 0): string {
  return value.toFixed(decimals);
}

// Halves are worth showing, whole kilograms are not worth a trailing zero.
function formatKg(weightKg: number): string {
  return formatNumber(weightKg, weightKg % 1 === 0 ? 0 : 1);
}

// The lifts are asked of everyone except a beginner, who has no numbers to
// recall. Until the question is answered they stay in, so the progress bar
// promises the longer path and shortens rather than grows.
export function buildSteps(experience: Experience | undefined): StepId[] {
  return [
    "welcome",
    "sex",
    "height",
    "weight",
    "experience",
    ...(experience === "none" ? [] : ANCHOR_IDS),
    "done",
  ];
}

export function isStepId(value: unknown): value is StepId {
  return (
    typeof value === "string" && buildSteps(undefined).includes(value as StepId)
  );
}

// Pullups carry the body along, so nothing on the belt is still an answer
// rather than an empty field — and it reads as words, not as a zero. That
// column carries its own unit, because half of its rows are not kilograms.
export function formatAnchorWeight(anchor: AnchorId, weightKg: number): string {
  if (anchor !== "pullup") return formatKg(weightKg);
  return weightKg === 0 ? "свой вес" : `+${formatKg(weightKg)} кг`;
}

export function anchorWeightUnits(anchor: AnchorId): string | undefined {
  return anchor === "pullup" ? undefined : "кг";
}

export function formatAnchorEntry(
  anchor: AnchorId,
  entry: AnchorEntry,
): string {
  const units = anchorWeightUnits(anchor);
  const weight = formatAnchorWeight(anchor, entry.weightKg);
  return `${weight}${units ? ` ${units}` : ""} × ${entry.reps}`;
}
