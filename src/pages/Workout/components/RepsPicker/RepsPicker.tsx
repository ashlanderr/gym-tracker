import s from "./styles.module.scss";
import { clsx } from "clsx";
import { useLayoutEffect, useRef } from "react";
import { REPS_PICKER_MAX } from "../constants.ts";
import type { RepsPickerProps } from "./types.ts";

const OPTIONS = Array.from({ length: REPS_PICKER_MAX }, (_, i) => i + 1);

export function RepsPicker({
  center,
  selected,
  target,
  onPick,
}: RepsPickerProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const centerRef = useRef<HTMLButtonElement | null>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const option = centerRef.current;
    if (!root || !option) return;
    root.scrollLeft =
      option.offsetLeft - (root.clientWidth - option.offsetWidth) / 2;
  }, []);

  return (
    <div className={s.root} ref={rootRef}>
      {OPTIONS.map((option) => (
        <button
          key={option}
          ref={option === center ? centerRef : undefined}
          className={clsx(
            s.option,
            target && option >= target.min && option <= target.max && s.target,
            option === selected && s.selected,
          )}
          onClick={() => onPick(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
