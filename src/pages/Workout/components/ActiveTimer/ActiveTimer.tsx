import { BottomSheet } from "../BottomSheet";
import { buildTimeParts } from "../../../hooks.ts";
import { useAtom } from "jotai";
import { TIMER_DEADLINE_ATOM } from "./constants.ts";
import s from "./styles.module.scss";
import { clsx } from "clsx";
import { useEffect, useState } from "react";

export function ActiveTimer() {
  const [deadline, setDeadline] = useAtom(TIMER_DEADLINE_ATOM);
  const [time, setTime] = useState(0);

  const changeHandler = (delta: number) => {
    if (!deadline) return;
    setDeadline(deadline + delta * 1000);
  };

  useEffect(() => {
    if (!deadline) return;

    const updateTime = () => {
      setTime(Math.ceil(Math.max(0, deadline - Date.now()) / 1000));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => {
      clearInterval(interval);
      setTime(0);
    };
  }, [deadline]);

  if (!time) return null;

  const { seconds, minutes } = buildTimeParts(time);
  const secondsStr = seconds.toString().padStart(2, "0");
  const minutesStr = minutes.toString().padStart(2, "0");
  const timeStr = `${minutesStr}:${secondsStr}`;

  return (
    <BottomSheet isOpen={true} hasBackdrop={false}>
      <div className={s.root}>
        <button className={s.button} onClick={() => changeHandler(-15)}>
          -15
        </button>
        <div className={s.time}>{timeStr}</div>
        <button className={s.button} onClick={() => changeHandler(15)}>
          +15
        </button>
        <button
          className={clsx(s.button, s.skipButton)}
          onClick={() => setDeadline(null)}
        >
          Пропустить
        </button>
      </div>
    </BottomSheet>
  );
}
