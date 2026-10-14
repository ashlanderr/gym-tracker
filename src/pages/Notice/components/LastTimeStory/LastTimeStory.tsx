import s from "./styles.module.scss";
import { clsx } from "clsx";
import {
  MdArrowDownward,
  MdArrowUpward,
  MdCheck,
  MdClose,
  MdFlag,
} from "react-icons/md";
import type { SetStep } from "../../../../domain";
import type { LastTimeStoryProps } from "./types.ts";

// The working sets of the last time as a story: a line for each set with
// where it went and how it came out, so the weight of today follows from it.
export function LastTimeStory({
  steps,
  range,
  formatWeight,
}: LastTimeStoryProps) {
  return (
    <div className={s.story}>
      <div className={s.heading}>В прошлый раз</div>
      {steps.map((step, index) => (
        <div key={index} className={clsx(s.step, s[step.result])}>
          <span className={s.icon}>{stepIcon(step)}</span>
          <b className={s.set}>
            {formatWeight(step.weight)} × {step.reps}
          </b>
          <span className={s.text}>
            {stepText(step, steps[index - 1], range.min)}
          </span>
        </div>
      ))}
    </div>
  );
}

function stepIcon(step: SetStep) {
  switch (step.move) {
    case "start":
      return <MdFlag />;
    case "same":
      return step.result === "short" ? <MdClose /> : <MdCheck />;
    case "up":
      return <MdArrowUpward />;
    case "down":
      return <MdArrowDownward />;
  }
}

function stepText(
  step: SetStep,
  before: SetStep | undefined,
  min: number,
): string {
  const isShort = step.result === "short";
  switch (step.move) {
    case "start":
      return isShort
        ? `начал с этого веса, не дотянул до ${min}`
        : "начал с этого веса";
    case "same":
      if (isShort) return `не дотянул до ${min} повторов`;
      return step.result === "top" ? "снова на максимум" : "удачно продолжил";
    case "up":
      return isShort ? "взял больше, не получилось" : "повысил вес, получилось";
    case "down":
      if (isShort) return "снизил вес, но не дотянул";
      return before?.result === "short"
        ? "снизил вес, вернулся в диапазон"
        : "снизил вес";
  }
}
