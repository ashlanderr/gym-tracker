import type { Transition } from "motion/react";
import type { Sex } from "../../db";

export const SEX_OPTIONS: { value: Sex; label: string }[] = [
  { value: "male", label: "Мужской" },
  { value: "female", label: "Женский" },
];

export const PICK_TRANSITION: Transition = {
  type: "spring",
  stiffness: 420,
  damping: 34,
};

// How far the picked figure steps toward the middle, in pixels. It moves by
// transform, so the row itself does not shift under it.
export const PICK_SHIFT = 10;

export const UNPICKED_SCALE = 0.88;
