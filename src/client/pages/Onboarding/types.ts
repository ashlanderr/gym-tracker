// The shapes the questions collect. They mirror `Profile` from
// docs/recommendations/README.md, but nothing is stored yet: the collection
// does not exist, so the flow keeps the answers in its own state.
import type { AnchorId, Sex } from "../../db";

export type { AnchorId, Sex };

export type Experience = "none" | "past" | "current";

// Every lift is a step of its own, so its id is a step id too.
export type StepId =
  | "welcome"
  | "sex"
  | "height"
  | "weight"
  | "experience"
  | AnchorId
  | "done";

// One remembered set, not a one-rep max: the conversion is ours to make.
// For pullups the weight is what was hung on the belt, zero means body weight.
export interface AnchorEntry {
  weightKg: number;
  reps: number;
}

export interface OnboardingDraft {
  sex?: Sex;
  heightCm?: number;
  weightKg?: number;
  experience?: Experience;
  anchors: Partial<Record<AnchorId, AnchorEntry>>;
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

export interface AnchorSpec {
  id: AnchorId;
  // The catalogue entry the step borrows its name and artwork from.
  exercise: string;
  weight: MeasureRange;
  // Where the scale opens, in kilograms: the novice weight for
  // DEFAULT_ANCHOR_REPS reps. A number scrolled past is free, a number left
  // as it stands must miss low.
  start: Record<Sex, number>;
}
