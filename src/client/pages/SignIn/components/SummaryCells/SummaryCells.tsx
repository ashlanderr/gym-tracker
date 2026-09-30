import s from "./styles.module.scss";
import type { SummaryCellsProps } from "./types.ts";

// Two figures side by side; the caption under each stays on one line, so it
// never breaks away from its number.
export function SummaryCells({ cells }: SummaryCellsProps) {
  return (
    <div className={s.root}>
      {cells.map(({ label, value, meta }) => (
        <div key={label} className={s.cell}>
          <span className={s.label}>{label}</span>
          <b className={s.value}>{value}</b>
          <span className={s.meta}>{meta}</span>
        </div>
      ))}
    </div>
  );
}
