import s from "./styles.module.scss";
import { MdAdd } from "react-icons/md";
import { LineChart } from "../LineChart";
import type { BodyTileProps } from "./types.ts";

// Half a row: the tile is the way into the history, the plus in its corner a
// new record for today.
export function BodyTile({
  label,
  value,
  meta,
  points,
  onOpen,
  onAdd,
}: BodyTileProps) {
  return (
    <div className={s.root}>
      <button className={s.main} onClick={onOpen}>
        <span className={s.label}>{label}</span>
        <span className={s.value}>{value}</span>
        <span className={s.meta}>{meta}</span>
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
