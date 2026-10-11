import type { PerformanceTimerProps } from "./types.ts";
import { MdOutlineTimer } from "react-icons/md";
import s from "./styles.module.scss";
import { buildTime, formatClock } from "../../../hooks.ts";
import { useState } from "react";
import { clsx } from "clsx";
import { BottomSheet, useStore } from "../../../../components";
import { TIMER_OPTIONS } from "./constants.ts";
import { updatePerformance } from "../../../../db";

// How long the rest is. The countdown itself is the panel at the bottom.
export function PerformanceTimer({ performance }: PerformanceTimerProps) {
  const store = useStore();
  const [chooseOpen, setChooseOpen] = useState(false);

  const time = performance.timer ? formatClock(performance.timer) : "ВЫКЛ";

  const chooseCompleteHandler = (option: number) => {
    updatePerformance(store, {
      ...performance,
      timer: option || undefined,
    });
    setChooseOpen(false);
  };

  return (
    <>
      <button className={s.root} onClick={() => setChooseOpen(true)}>
        <MdOutlineTimer className={s.icon} />
        <span className={s.label}>Отдых</span>
        <span className={s.time}>{time}</span>
      </button>
      {chooseOpen && (
        <BottomSheet isOpen={true} onClose={() => setChooseOpen(false)}>
          <div className={s.sheetHeader}>Таймер отдыха</div>
          <div className={s.sheetSelector}>
            {TIMER_OPTIONS.map((t) => (
              <button
                className={clsx(
                  s.sheetOption,
                  t === (performance.timer ?? 0) && s.selected,
                )}
                key={t}
                onClick={() => chooseCompleteHandler(t)}
              >
                {t ? buildTime(0, t * 1000) : "ВЫКЛ"}
              </button>
            ))}
          </div>
        </BottomSheet>
      )}
    </>
  );
}
