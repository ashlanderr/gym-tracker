import type { PerformanceTimerProps } from "./types.ts";
import { MdOutlineTimer } from "react-icons/md";
import s from "./styles.module.scss";
import { buildTime } from "../../../hooks.ts";
import { useModalStack } from "../../../../components";
import { TimerSheet } from "../TimerSheet";

export function PerformanceTimer({ performance }: PerformanceTimerProps) {
  const { pushModal } = useModalStack();

  const time = performance.timer
    ? buildTime(0, performance.timer * 1000)
    : "ВЫКЛ";

  return (
    <button
      className={s.root}
      onClick={() => pushModal(TimerSheet, performance)}
    >
      <MdOutlineTimer className={s.icon} />
      <span>Таймер отдыха:</span>
      <span>{time}</span>
    </button>
  );
}
