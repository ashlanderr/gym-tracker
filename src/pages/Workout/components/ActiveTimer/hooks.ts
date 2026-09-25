import { useAtom } from "jotai";
import { TIMER_DEADLINE_ATOM } from "./constants.ts";
import { cancelSound, scheduleSound } from "./sound.ts";

export function useActiveTimer() {
  const [deadline, setDeadline] = useAtom(TIMER_DEADLINE_ATOM);
  return {
    deadline,
    startTimer: (timeSeconds: number | undefined) => {
      if (timeSeconds && timeSeconds > 0) {
        const newDeadline = Date.now() + timeSeconds * 1000;
        setDeadline(newDeadline);
        scheduleSound(newDeadline);
      } else {
        setDeadline(null);
        cancelSound();
      }
    },
  };
}
