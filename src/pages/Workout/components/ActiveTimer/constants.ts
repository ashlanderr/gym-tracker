import { atom } from "jotai";
import { default as SoundUrl } from "./sound_with_silence.mp3";

export const TIMER_DEADLINE_ATOM = atom<number | null>(null);

export const AUDIO_ELEMENT = (() => {
  const source = document.createElement("source");
  source.src = SoundUrl;
  source.type = "audio/mpeg";

  const audio = document.createElement("audio");
  audio.appendChild(source);

  document.body.appendChild(audio);

  return audio;
})();
