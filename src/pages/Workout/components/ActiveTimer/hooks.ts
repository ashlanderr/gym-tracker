import { useAtom } from "jotai";
import { TIMER_ATOM } from "./constants.ts";
import { clampActiveTimer } from "./utils.ts";

export function useActiveTimer() {
  const [, setTime] = useAtom(TIMER_ATOM);
  return {
    startTimer: (time: number | undefined) => {
      setTime(clampActiveTimer(time ?? 0));
    },
  };
}
