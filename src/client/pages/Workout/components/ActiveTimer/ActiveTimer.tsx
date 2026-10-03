import { BottomSheet } from "../../../../components";
import { buildTimeParts } from "../../../hooks.ts";
import s from "./styles.module.scss";
import { clsx } from "clsx";
import { useEffect, useState } from "react";
import { useActiveTimer } from "./hooks.ts";

export function ActiveTimer() {
  const { deadline, startTimer } = useActiveTimer();
  const [time, setTime] = useState(0);

  const changeHandler = (delta: number) => {
    if (!deadline) return;
    startTimer((deadline - Date.now()) / 1000 + delta);
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
          onClick={() => startTimer(undefined)}
        >
          Пропустить
        </button>
      </div>
    </BottomSheet>
  );
}
