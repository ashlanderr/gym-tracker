import s from "./styles.module.scss";
import { MdAdd } from "react-icons/md";
import type { GirthsCardProps } from "./types.ts";

// The girths are taken together with one tape, so they share one card and
// one plus; each value still opens its own history.
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
        <span className={s.text}>
          <span className={s.label}>{label}</span>
          <span className={s.meta}>{meta}</span>
        </span>
        <button
          className={s.add}
          aria-label={`${label}: новая запись`}
          onClick={onAdd}
        >
          <MdAdd />
        </button>
      </div>
      <div className={s.grid}>
        {cells.map(({ type, label, value, change }) => (
          <button key={type} className={s.cell} onClick={() => onOpen(type)}>
            <span className={s.label}>{label}</span>
            <span className={s.value}>{value}</span>
            <span className={s.meta}>{change ?? " "}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
