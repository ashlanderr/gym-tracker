// The shapes the questions collect. The flow keeps them in its own state and
// writes them all at once on the last step.
import type { ExperienceLevel, Sex } from "../../db";

export type { ExperienceLevel, Sex };

export type StepId =
  | "welcome"
  | "sex"
  | "height"
  | "weight"
  | "experience"
  | "done";

export interface OnboardingDraft {
  sex?: Sex;
  heightCm?: number;
  weightKg?: number;
  experience?: ExperienceLevel;
}

export interface ChoiceOption<T> {
  value: T;
  label: string;
  note?: string;
}

export interface MeasureRange {
  min: number;
  max: number;
  step: number;
  // Ticks between two labelled ones.
  majorEvery: number;
}
