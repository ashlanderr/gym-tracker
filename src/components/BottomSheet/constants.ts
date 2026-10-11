import type { Transition } from "motion/react";

export const SHEET_TRANSITION: Transition = {
  type: "tween",
  ease: [0.32, 0.72, 0, 1],
  duration: 0.28,
};
