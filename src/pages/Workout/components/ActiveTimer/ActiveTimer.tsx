import { BottomSheet } from "../BottomSheet";
import { buildTimeParts } from "../../../hooks.ts";
import { useAtom } from "jotai";
import { TIMER_ATOM } from "./constants.ts";
import s from "./styles.module.scss";
import { clsx } from "clsx";
import { useEffect } from "react";
import { clampActiveTimer } from "./utils.ts";

export function ActiveTimer() {
  const [timer, setTimer] = useAtom(TIMER_ATOM);
  const isActive = timer !== 0;

  const changeHandler = (delta: number) => {
    setTimer(clampActiveTimer(timer + delta));
  };

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setTimer((time) => clampActiveTimer(time - 1));
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [setTimer, isActive]);

  const { seconds, minutes } = buildTimeParts(timer);
  const secondsStr = seconds.toString().padStart(2, "0");
  const minutesStr = minutes.toString().padStart(2, "0");
  const timeStr = `${minutesStr}:${secondsStr}`;

  if (!isActive) return null;

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
          onClick={() => setTimer(0)}
        >
          Пропустить
        </button>
      </div>
    </BottomSheet>
  );
}
