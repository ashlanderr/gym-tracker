import s from "./styles.module.scss";
import { clsx } from "clsx";
import type { DayCellProps } from "./types.ts";

export function DayCell({
  date,
  weekday,
  mark,
  selected,
  today,
  muted,
  onClick,
}: DayCellProps) {
  return (
    <button
      className={clsx(
        s.root,
        selected && s.selected,
        today && s.today,
        muted && s.muted,
      )}
      onClick={onClick}
    >
      {weekday && <span className={s.weekday}>{weekday}</span>}
      <span className={s.number}>{date.getDate()}</span>
      <span className={clsx(s.dot, mark && s[mark])} />
    </button>
  );
}
