import type { PerformanceTimerProps } from "./types.ts";
import { MdOutlineTimer } from "react-icons/md";
import s from "./styles.module.scss";
import { formatClock } from "../../../hooks.ts";
import { useModalStack, useStore } from "../../../../components";
import { updatePerformance } from "../../../../db";
import { RestTimerSheet } from "../RestTimerSheet";

// How long the rest is. The countdown itself is the panel at the bottom.
export function PerformanceTimer({ performance }: PerformanceTimerProps) {
  const store = useStore();
  const { pushModal } = useModalStack();

  const time = performance.timer ? formatClock(performance.timer) : "ВЫКЛ";

  const chooseHandler = async () => {
    const timer = await pushModal(RestTimerSheet, {
      current: performance.timer ?? 0,
    });
    if (timer !== undefined) {
      updatePerformance(store, { ...performance, timer: timer || undefined });
    }
  };

  return (
    <button className={s.root} onClick={chooseHandler}>
      <MdOutlineTimer className={s.icon} />
      <span className={s.label}>Отдых</span>
      <span className={s.time}>{time}</span>
    </button>
  );
}
