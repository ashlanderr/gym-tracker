import s from "./styles.module.scss";
import { clsx } from "clsx";
import { motion } from "motion/react";
import { StepLayout } from "../StepLayout";
import type { ChoiceStepProps } from "./types.ts";

// A single choice needs no confirmation: the tap is the answer, and the step
// moves on by itself. Two options stand side by side, more of them stack.
export function ChoiceStep<T extends string>({
  question,
  note,
  why,
  options,
  value,
  onSelect,
}: ChoiceStepProps<T>) {
  return (
    <StepLayout question={question} note={note} why={why}>
      <div className={clsx(s.options, options.length === 2 && s.pair)}>
        {options.map((option) => (
          <motion.button
            key={option.value}
            className={clsx(s.option, value === option.value && s.selected)}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(option.value)}
          >
            <span className={s.label}>{option.label}</span>
            {option.note && <span className={s.note}>{option.note}</span>}
          </motion.button>
        ))}
      </div>
    </StepLayout>
  );
}
