import s from "./styles.module.scss";
import { MdAdd } from "react-icons/md";
import { LineChart } from "../LineChart";
import type { BodyCardProps } from "./types.ts";

// The card is the way into the history; the plus beside it is the everyday
// shortcut, a new record for today without going there first.
export function BodyCard({
  label,
  value,
  meta,
  points,
  onOpen,
  onAdd,
}: BodyCardProps) {
  return (
    <div className={s.root}>
      <button className={s.main} onClick={onOpen}>
        <span className={s.text}>
          <span className={s.label}>{label}</span>
          <span className={s.value}>{value}</span>
          <span className={s.meta}>{meta}</span>
        </span>
        {points && points.length > 1 && (
          <LineChart className={s.chart} points={points} />
        )}
      </button>
      <button
        className={s.add}
        aria-label={`${label}: новая запись`}
        onClick={onAdd}
      >
        <MdAdd />
      </button>
    </div>
  );
}
