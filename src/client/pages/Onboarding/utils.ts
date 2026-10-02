import { STEPS } from "./constants.ts";
import type { StepId } from "./types.ts";

export function formatNumber(value: number, decimals = 0): string {
  return value.toFixed(decimals);
}

export function isStepId(value: unknown): value is StepId {
  return typeof value === "string" && STEPS.includes(value as StepId);
}
