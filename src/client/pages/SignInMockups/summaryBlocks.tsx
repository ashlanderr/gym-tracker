import m from "./screens.module.scss";
import { clsx } from "clsx";
import type { Row } from "./summaries.ts";

export function Cells({ rows }: { rows: Row[] }) {
  return (
    <div className={clsx(m.compare, m.summary)}>
      {rows.map(({ label, value, meta }) => (
        <div key={label}>
          <span>{label}</span>
          <b>{value}</b>
          <i>{meta}</i>
        </div>
      ))}
    </div>
  );
}
