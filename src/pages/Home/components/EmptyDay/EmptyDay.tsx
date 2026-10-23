import s from "./styles.module.scss";
import { clsx } from "clsx";
import type { ReactNode } from "react";
import { MdAdd, MdBolt, MdEditCalendar, MdHistory } from "react-icons/md";
import { EMPTY_DAY_TEXTS } from "./constants.ts";
import type { EmptyDayKind, EmptyDayProps } from "./types.ts";

const BADGES: Record<EmptyDayKind, ReactNode> = {
  first: <MdBolt />,
  today: <MdAdd />,
  past: <MdHistory />,
  future: <MdEditCalendar />,
};

// A day you can train on is lit with the accent, a day ahead stays grey.
export function EmptyDay({ kind }: EmptyDayProps) {
  const { title, note } = EMPTY_DAY_TEXTS[kind];

  return (
    <div className={clsx(s.root, kind === "future" && s.muted)}>
      <div className={s.art}>
        <svg viewBox="0 0 160 120" aria-hidden>
          <defs>
            <radialGradient id="empty-day-glow">
              <stop offset="0" className={s.glow} stopOpacity="0.28" />
              <stop offset="1" className={s.glow} stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="80" cy="60" r="60" fill="url(#empty-day-glow)" />
          <circle className={s.ring} cx="80" cy="60" r="42" />
          <g transform="rotate(-24 80 60)">
            <rect
              className={s.bar}
              x="44"
              y="57"
              width="72"
              height="6"
              rx="3"
            />
            <rect
              className={s.plate}
              x="51"
              y="40"
              width="10"
              height="40"
              rx="3"
            />
            <rect
              className={s.plate}
              x="99"
              y="40"
              width="10"
              height="40"
              rx="3"
            />
            <rect
              className={s.smallPlate}
              x="42"
              y="47"
              width="8"
              height="26"
              rx="3"
            />
            <rect
              className={s.smallPlate}
              x="110"
              y="47"
              width="8"
              height="26"
              rx="3"
            />
          </g>
          <path className={s.spark} d="M24 26l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" />
          <path
            className={s.spark}
            d="M138 84l1.5 4.5 4.5 1.5-4.5 1.5-1.5 4.5-1.5-4.5-4.5-1.5 4.5-1.5z"
          />
          <circle className={s.spark} cx="136" cy="30" r="2" />
        </svg>
        <div className={s.badge}>{BADGES[kind]}</div>
      </div>
      <div className={s.title}>{title}</div>
      <div className={s.note}>{note}</div>
    </div>
  );
}
