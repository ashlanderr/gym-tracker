import s from "./styles.module.scss";
import type { RestPillProps } from "./types.ts";

// The rest floats over the sets instead of covering the bottom of the page:
// the next set stays in view while waiting for it.
export function RestPill({ time, progress }: RestPillProps) {
  return (
    <div className={s.root}>
      <div className={s.pill}>
        <span
          className={s.ring}
          style={{
            background: `conic-gradient(#0a84ff ${progress * 360}deg, #2c2c2e 0)`,
          }}
        />
        <div className={s.text}>
          <div className={s.label}>Отдых</div>
          <div className={s.time}>{time}</div>
        </div>
        <span className={s.key}>+15</span>
        <span className={s.skip}>Дальше</span>
      </div>
    </div>
  );
}
