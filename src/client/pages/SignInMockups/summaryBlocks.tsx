import m from "./screens.module.scss";
import { clsx } from "clsx";
import type { Row } from "./summaries.ts";

// A. Two cells side by side, as in the current mockup.

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

// B. One row per figure across the whole width, the number on the right.

export function List({ rows }: { rows: Row[] }) {
  return (
    <div className={m.list}>
      {rows.map(({ label, value, meta }) => (
        <div key={label}>
          <span>
            {label}
            <i>{meta}</i>
          </span>
          <b>{value}</b>
        </div>
      ))}
    </div>
  );
}

// C. A headline number and plain sentences under it.

export function Sentences({ head, lines }: { head: string; lines: string[] }) {
  return (
    <div className={m.sentences}>
      <b>{head}</b>
      {lines.map((line) => (
        <span key={line}>{line}</span>
      ))}
    </div>
  );
}
