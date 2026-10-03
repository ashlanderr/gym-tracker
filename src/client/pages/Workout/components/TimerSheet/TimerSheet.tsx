import s from "./styles.module.scss";
import { useEffect, useRef, useState } from "react";
import {
  BottomSheet,
  type ModalProps,
  Ruler,
  useStore,
} from "../../../../components";
import { type Performance, updatePerformance } from "../../../../db";
import { formatDuration } from "../../hooks.ts";
import {
  TIMER_MAJOR_EVERY,
  TIMER_MAX_SECONDS,
  TIMER_STEP_SECONDS,
} from "./constants.ts";

export function TimerSheet({
  data: performance,
  onCancel,
}: ModalProps<Performance, null>) {
  const store = useStore();
  const [seconds, setSeconds] = useState(performance.timer ?? 0);
  const secondsRef = useRef(seconds);

  // A fling passes dozens of values, so the timer is written once, when the
  // sheet goes away, however it is closed.
  useEffect(() => {
    return () => {
      const timer = secondsRef.current || undefined;
      if (timer !== performance.timer) {
        updatePerformance(store, { ...performance, timer });
      }
    };
  }, [store, performance]);

  const changeHandler = (value: number) => {
    secondsRef.current = value;
    setSeconds(value);
  };

  return (
    <BottomSheet onClose={onCancel}>
      <div className={s.root}>
        <div className={s.grip} />
        <div className={s.title}>Отдых между подходами</div>
        <div className={s.picker}>
          <div className={s.value}>{formatTimer(seconds)}</div>
          <div className={s.ruler}>
            <Ruler
              axis="y"
              min={0}
              max={TIMER_MAX_SECONDS}
              step={TIMER_STEP_SECONDS}
              majorEvery={TIMER_MAJOR_EVERY}
              value={seconds}
              format={formatTimer}
              onChange={changeHandler}
            />
          </div>
        </div>
      </div>
    </BottomSheet>
  );
}

function formatTimer(seconds: number): string {
  return seconds ? formatDuration(seconds) : "выкл";
}
