import type { Transition, Variants } from "motion/react";
import type {
  ChoiceOption,
  ExperienceLevel,
  MeasureRange,
  Sex,
  StepId,
} from "./types.ts";

export const STEPS: StepId[] = [
  "welcome",
  "sex",
  "height",
  "weight",
  "experience",
  "done",
];

// The recap lists who the person is, in words of its own rather than the
// labels of the cards that asked.
export const SEX_SUMMARY: Record<Sex, string> = {
  male: "Мужчина",
  female: "Женщина",
};

export const EXPERIENCE_OPTIONS: ChoiceOption<ExperienceLevel>[] = [
  {
    value: "novice",
    label: "Только начинаю",
    note: "В зале меньше полугода",
  },
  {
    value: "intermediate",
    label: "Есть опыт",
    note: "От полугода до двух лет",
  },
  {
    value: "experienced",
    label: "Давно в зале",
    note: "Больше двух лет",
  },
];

// Plausible places for the scales to open.
export const DEFAULT_HEIGHT_CM: Record<Sex, number> = {
  male: 178,
  female: 165,
};

export const DEFAULT_WEIGHT_KG: Record<Sex, number> = {
  male: 80,
  female: 65,
};

export const HEIGHT_RANGE: MeasureRange = {
  min: 130,
  max: 220,
  step: 1,
  majorEvery: 10,
};

export const WEIGHT_RANGE: MeasureRange = {
  min: 35,
  max: 180,
  step: 0.5,
  majorEvery: 10,
};

// Long enough to see the answer light up, short enough not to feel like a wait.
export const ADVANCE_DELAY = 220;

// Steps travel along one axis, like the pages they sit inside: forward comes
// in from the right, back returns the way it came.
const STEP_OFFSET = 36;

export const STEP_VARIANTS: Variants = {
  enter: (direction: number) => ({ x: direction * STEP_OFFSET, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: -direction * STEP_OFFSET, opacity: 0 }),
};

export const STEP_TRANSITION: Transition = {
  type: "tween",
  ease: [0.32, 0.72, 0, 1],
  duration: 0.24,
};
