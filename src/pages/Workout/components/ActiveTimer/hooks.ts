import { useAtom } from "jotai";
import { AUDIO_ELEMENT, TIMER_DEADLINE_ATOM } from "./constants.ts";
import { useEffect, useState } from "react";
import { default as SoundUrl } from "./sound.mp3";

export function useActiveTimer() {
  const [, setDeadline] = useAtom(TIMER_DEADLINE_ATOM);
  return {
    startTimer: (
      timeSeconds: number | undefined,
      soundUrl: string | undefined,
    ) => {
      if (timeSeconds) {
        setDeadline(Date.now() + timeSeconds * 1000);
        if (soundUrl) {
          AUDIO_ELEMENT.src = soundUrl;
          AUDIO_ELEMENT.load();
          AUDIO_ELEMENT.currentTime = 0;
          AUDIO_ELEMENT.play();
        }
      } else {
        setDeadline(null);
        AUDIO_ELEMENT.pause();
      }
    },
  };
}

export function useTimerAudio(
  delaySeconds: number | undefined,
): string | undefined {
  const [objectUrl, setObjectUrl] = useState<string>();

  useEffect(() => {
    let cancelled = false;
    let tmpUrl: string | null = null;

    async function prepare() {
      if (!delaySeconds) {
        setObjectUrl(undefined);
        return;
      }

      const blob: Blob = await buildDelayedBlob(SoundUrl, delaySeconds);

      if (cancelled) return;
      tmpUrl = URL.createObjectURL(blob);
      setObjectUrl(tmpUrl);
    }

    prepare().catch(console.error);

    return () => {
      cancelled = true;
      if (tmpUrl) URL.revokeObjectURL(tmpUrl);
    };
  }, [delaySeconds]);

  return objectUrl;
}

async function buildDelayedBlob(originalUrl: string, delaySeconds: number) {
  const res = await fetch(originalUrl, { mode: "cors" });
  if (!res.ok) throw new Error("Failed to load original audio file");
  const arrayBuf = await res.arrayBuffer();

  const AudioCtx = window.AudioContext;
  const audioCtx = new AudioCtx();

  const srcBuffer = await new Promise<AudioBuffer>((resolve, reject) => {
    const onSuccess = (buf: AudioBuffer) => resolve(buf);
    const onError = (err: Error) => reject(err);
    const r = audioCtx.decodeAudioData(arrayBuf, onSuccess, onError);
    if (r && typeof r.then === "function") r.then(resolve).catch(reject);
  });

  const sampleRate = srcBuffer.sampleRate;
  const channels = srcBuffer.numberOfChannels;
  const silenceLength = Math.round(delaySeconds * sampleRate);

  const outBuffer = audioCtx.createBuffer(
    channels,
    silenceLength + srcBuffer.length,
    sampleRate,
  );

  for (let ch = 0; ch < channels; ch++) {
    const out = outBuffer.getChannelData(ch);
    const src = srcBuffer.getChannelData(ch);
    out.set(src, silenceLength);
  }

  return audioBufferToWavBlob(outBuffer);
}

function audioBufferToWavBlob(buffer: AudioBuffer) {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const length = buffer.length;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;

  const dataSize = length * numChannels * bytesPerSample;
  const bufferSize = 44 + dataSize;
  const ab = new ArrayBuffer(bufferSize);
  const view = new DataView(ab);

  let offset = 0;
  const writeString = (s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(offset++, s.charCodeAt(i));
  };
  const writeUint32 = (v: number) => {
    view.setUint32(offset, v, true);
    offset += 4;
  };
  const writeUint16 = (v: number) => {
    view.setUint16(offset, v, true);
    offset += 2;
  };

  // RIFF/WAVE заголовок
  writeString("RIFF");
  writeUint32(36 + dataSize);
  writeString("WAVE");
  writeString("fmt ");
  writeUint32(16); // PCM chunk size
  writeUint16(1); // PCM format
  writeUint16(numChannels);
  writeUint32(sampleRate);
  writeUint32(byteRate);
  writeUint16(blockAlign);
  writeUint16(16); // bits per sample
  writeString("data");
  writeUint32(dataSize);

  // Межканальное чередование и float → int16
  let idx = 44;
  for (let i = 0; i < length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      let s = buffer.getChannelData(ch)[i];
      s = Math.max(-1, Math.min(1, s));
      view.setInt16(idx, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      idx += 2;
    }
  }
  return new Blob([view], { type: "audio/wav" });
}
