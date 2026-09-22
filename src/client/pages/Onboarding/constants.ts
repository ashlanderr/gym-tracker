import type { Transition, Variants } from "motion/react";
import type {
  AnchorId,
  AnchorSpec,
  ChoiceOption,
  Experience,
  MeasureRange,
  Sex,
} from "./types.ts";

// The cards answer "какой пол", the recap lists who the person is, and the
// two need different words for it.
export const SEX_OPTIONS: ChoiceOption<Sex>[] = [
  { value: "male", label: "Мужской" },
  { value: "female", label: "Женский" },
];

export const SEX_SUMMARY: Record<Sex, string> = {
  male: "Мужчина",
  female: "Женщина",
};

// Russian makes the past tense pick a side, and by this question we already
// know which one. The app says "Сделал" to everyone only because nothing has
// asked yet — here it has.
export const EXPERIENCE_OPTIONS: Record<Sex, ChoiceOption<Experience>[]> = {
  male: [
    {
      value: "none",
      label: "Только начинаю",
      note: "В зале не был или сходил пару раз",
    },
    {
      value: "past",
      label: "Занимался раньше",
      note: "Сейчас перерыв, но свои веса помню",
    },
    {
      value: "current",
      label: "Занимаюсь сейчас",
      note: "Регулярно, знаю свои рабочие веса",
    },
  ],
  female: [
    {
      value: "none",
      label: "Только начинаю",
      note: "В зале не была или сходила пару раз",
    },
    {
      value: "past",
      label: "Занималась раньше",
      note: "Сейчас перерыв, но свои веса помню",
    },
    {
      value: "current",
      label: "Занимаюсь сейчас",
      note: "Регулярно, знаю свои рабочие веса",
    },
  ],
};

// Body weight matches the profile the starting weights were computed for;
// height only has to be a plausible place for the scale to open.
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

// Reps are asked on the same scale as the weight, switched by tapping the
// number: one control, and no second kind of stepper to learn.
export const REPS_RANGE: MeasureRange = {
  min: 1,
  max: 30,
  step: 1,
  majorEvery: 5,
};

const BARBELL_RANGE: MeasureRange = {
  min: 20,
  max: 300,
  step: 2.5,
  majorEvery: 4,
};

export const ANCHORS: AnchorSpec[] = [
  {
    id: "bench",
    exercise: "bench_press",
    weight: BARBELL_RANGE,
    // 22 / 1.2 is 18.3 for a woman, lighter than the bar itself — the same
    // result starting-weights.md records as "не проходит". The scale cannot
    // open below its own first value, so it opens on the empty bar.
    start: { male: 37.5, female: 20 },
  },
  {
    id: "squat",
    exercise: "back_squat",
    weight: BARBELL_RANGE,
    start: { male: 50, female: 25 },
  },
  {
    id: "deadlift",
    exercise: "deadlift",
    weight: BARBELL_RANGE,
    start: { male: 62.5, female: 32.5 },
  },
  {
    // The weight here is what hangs on the belt, and for almost everybody
    // that is nothing — so the scale starts at zero and says so in words.
    id: "pullup",
    exercise: "pull_up_wide",
    weight: { min: 0, max: 60, step: 2.5, majorEvery: 4 },
    start: { male: 0, female: 0 },
  },
];

export const ANCHOR_IDS: AnchorId[] = ANCHORS.map((anchor) => anchor.id);

// The pair the picker opens on is one guess, not two: the weight beside it is
// the novice one-rep max from starting-weights.md carried down to this many
// reps by Epley and rounded to the plates, downwards where it lands between
// them — an answer nobody corrects has to miss low.
export const DEFAULT_ANCHOR_REPS = 6;

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
