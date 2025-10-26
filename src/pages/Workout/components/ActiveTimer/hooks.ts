import { useAtom } from "jotai";
import { AUDIO_ELEMENT, TIMER_DEADLINE_ATOM } from "./constants.ts";
import { default as SoundUrl } from "./sound.mp3";

export function useActiveTimer() {
  const [, setDeadline] = useAtom(TIMER_DEADLINE_ATOM);
  return {
    startTimer: (timeSeconds: number | undefined) => {
      if (timeSeconds) {
        setDeadline(Date.now() + timeSeconds * 1000);
        startAudio(AUDIO_ELEMENT, SoundUrl, timeSeconds);
      } else {
        setDeadline(null);
        AUDIO_ELEMENT.pause();
      }
    },
  };
}

async function startAudio(
  audioEl: HTMLAudioElement,
  url: string,
  delaySec: number,
) {
  const ctx = new AudioContext();
  await ctx.resume();

  const arr = await fetch(url).then((r) => r.arrayBuffer());
  const buffer = await ctx.decodeAudioData(arr);

  const src = ctx.createBufferSource();
  src.buffer = buffer;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, ctx.currentTime + delaySec);
  gain.gain.linearRampToValueAtTime(1, ctx.currentTime + delaySec + 0.05);

  const dest = ctx.createMediaStreamDestination();
  src.connect(gain).connect(dest);

  audioEl.srcObject = dest.stream;

  const startAt = ctx.currentTime + delaySec;
  src.start(startAt);

  try {
    await audioEl.play();
  } catch (e) {
    console.warn("Failed to start audio", e);
  }

  src.addEventListener("ended", () => {
    audioEl.srcObject = null;
    ctx.close();
  });
}
