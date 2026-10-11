import { buildTimeParts } from "../../../hooks.ts";
import s from "./styles.module.scss";
import { clsx } from "clsx";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { SHEET_TRANSITION } from "../../../../components";
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

  const { seconds, minutes } = buildTimeParts(time);
  const secondsStr = seconds.toString().padStart(2, "0");
  const minutesStr = minutes.toString().padStart(2, "0");
  const timeStr = `${minutesStr}:${secondsStr}`;

  return createPortal(
    <AnimatePresence>
      {time !== 0 && (
        <motion.div
          key="timer"
          className={s.panel}
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={SHEET_TRANSITION}
        >
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
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
