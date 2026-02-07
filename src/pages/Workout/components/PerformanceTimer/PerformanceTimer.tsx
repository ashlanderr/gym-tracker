import type { PerformanceTimerProps } from "./types.ts";
import { MdOutlineTimer } from "react-icons/md";
import s from "./styles.module.scss";
import { buildTime } from "../../../hooks.ts";
import { useState } from "react";
import { BottomSheet, useStore } from "../../../../components";
import { TIMER_OPTIONS } from "./constants.ts";
import { updatePerformance } from "../../../../db";

export function PerformanceTimer({ performance, readonly }: PerformanceTimerProps) {
  const store = useStore();
  const [chooseOpen, setChooseOpen] = useState(false);

  const time = performance.timer
    ? buildTime(0, performance.timer * 1000)
    : "ВЫКЛ";

  const chooseBeginHandler = () => {
    if (!readonly) {
      setChooseOpen(true);
    }
  };

  const chooseCompleteHandler = (option: number) => {
    updatePerformance(store, {
      ...performance,
      timer: option || undefined,
    });
    setChooseOpen(false);
  };

  return (
    <>
      <button className={s.root} onClick={chooseBeginHandler}>
        <MdOutlineTimer className={s.icon} />
        <span>Таймер отдыха:</span>
        <span>{time}</span>
      </button>
      {chooseOpen && (
        <BottomSheet isOpen={true} onClose={() => setChooseOpen(false)}>
          <div className={s.sheetHeader}>Таймер отдыха</div>
          <div className={s.sheetSelector}>
            {TIMER_OPTIONS.map((t) => (
              <button
                className={s.sheetOption}
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
