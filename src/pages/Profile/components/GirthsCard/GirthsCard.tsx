import s from "./styles.module.scss";
import { MdAdd } from "react-icons/md";
import type { GirthsCardProps } from "./types.ts";

// The girths are taken together with one tape, so they share one card and
// one plus; each value still opens its own history. The columns are the
// columns of the tiles above, so the values line up under weight and height.
export function GirthsCard({
  label,
  meta,
  cells,
  onOpen,
  onAdd,
}: GirthsCardProps) {
  return (
    <div className={s.root}>
      <div className={s.head}>
        <span className={s.title}>{label}</span>
        <span className={s.meta}>{meta}</span>
        <button
          className={s.add}
          aria-label={`${label}: новая запись`}
          onClick={onAdd}
        >
          <MdAdd />
        </button>
      </div>
      {cells.map(({ type, label, value, change }) => (
        <button key={type} className={s.cell} onClick={() => onOpen(type)}>
          <span className={s.label}>{label}</span>
          <span className={s.value}>{value}</span>
          <span className={s.meta}>{change ?? " "}</span>
        </button>
      ))}
    </div>
  );
}
