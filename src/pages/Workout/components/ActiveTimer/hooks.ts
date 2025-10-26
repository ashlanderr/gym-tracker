import { useAtom } from "jotai";
import { AUDIO_ELEMENT, TIMER_DEADLINE_ATOM } from "./constants.ts";

export function useActiveTimer() {
  const [, setDeadline] = useAtom(TIMER_DEADLINE_ATOM);
  return {
    startTimer: (timeSeconds: number | undefined) => {
      setDeadline(timeSeconds ? Date.now() + timeSeconds * 1000 : null);
      AUDIO_ELEMENT.play();
    },
  };
}
