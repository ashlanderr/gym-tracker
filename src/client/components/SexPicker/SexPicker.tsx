import s from "./styles.module.scss";
import { clsx } from "clsx";
import { motion } from "motion/react";
import { SexFigure } from "../SexFigure";
import {
  PICK_SHIFT,
  PICK_TRANSITION,
  SEX_OPTIONS,
  UNPICKED_SCALE,
} from "./constants.ts";
import type { SexPickerProps } from "./types.ts";

// Nothing is framed until it is chosen: without a card around them the two
// figures can be drawn as large as the row allows. The choice then shows as
// movement — the picked one steps toward the middle and takes the frame, the
// other shrinks back — rather than as a border appearing out of nowhere.
export function SexPicker({ value, className, onSelect }: SexPickerProps) {
  return (
    <div className={clsx(s.options, className)}>
      {SEX_OPTIONS.map((option, index) => {
        const isPicked = value === option.value;
        const toCentre = index === 0 ? PICK_SHIFT : -PICK_SHIFT;

        return (
          <motion.button
            key={option.value}
            className={clsx(s.option, isPicked && s.picked)}
            animate={{
              scale: value && !isPicked ? UNPICKED_SCALE : 1,
              x: isPicked ? toCentre : 0,
            }}
            transition={PICK_TRANSITION}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(option.value)}
          >
            {isPicked && (
              <motion.span
                className={s.fill}
                layoutId="sexPick"
                transition={PICK_TRANSITION}
              />
            )}
            <span className={s.art}>
              <SexFigure sex={option.value} className={s.figure} />
            </span>
            <span className={s.label}>{option.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
