import s from "./styles.module.scss";
import { clsx } from "clsx";
import type { ExerciseMarkProps, ExerciseMarkType } from "./types.ts";

const PATHS: Record<ExerciseMarkType, string> = {
  inventory:
    "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94z",
  unknown:
    "M12 5a7 7 0 1 0 0 14a7 7 0 1 0 0-14M12 10.5a1.5 1.5 0 1 0 0 3a1.5 1.5 0 1 0 0-3M12 2v3M12 19v3M2 12h3M19 12h3",
  increase: "M12 19V5M6 11l6-6 6 6",
};

export function ExerciseMark({ type }: ExerciseMarkProps) {
  return (
    <span className={clsx(s.mark, s[type])}>
      <svg viewBox="0 0 24 24">
        <path d={PATHS[type]} />
      </svg>
    </span>
  );
}
