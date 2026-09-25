import SoundDataUrl from "./sound.mp3?inline";
import { logSound } from "../../../../utils";

type Player = {
  context: AudioContext;
  destination: MediaStreamAudioDestinationNode;
  element: HTMLAudioElement;
};

type Playback = {
  source: AudioBufferSourceNode | null;
  deadline: number;
  anchorDate: number;
  anchorContextTime: number;
};

let player: Player | null = null;
let bufferPromise: Promise<AudioBuffer> | null = null;
let current: Playback | null = null;

export function scheduleSound(deadline: number) {
  const { context, element } = getPlayer();
  stopCurrent("restart");

  const playback: Playback = {
    source: null,
    deadline,
    anchorDate: Date.now(),
    anchorContextTime: context.currentTime,
  };
  current = playback;
  logSound("schedule", {
    delaySec: round((deadline - Date.now()) / 1000),
    contextState: context.state,
  });

  // Both calls happen synchronously inside the tap handler to keep the user activation
  context
    .resume()
    .catch((e) => logSound("resume failed", { error: String(e) }));
  element
    .play()
    .then(() => logSound("play ok"))
    .catch((e) => logSound("play failed", { error: String(e) }));

  loadBuffer(context)
    .then((buffer) => {
      if (current !== playback) return;
      startSource(playback, buffer);
    })
    .catch((e) => logSound("decode failed", { error: String(e) }));
}

export function cancelSound() {
  stopCurrent("cancel");
}

function startSource(playback: Playback, buffer: AudioBuffer) {
  const { context, destination, element } = getPlayer();
  const delaySec = Math.max(0, (playback.deadline - Date.now()) / 1000);
  const startAt = context.currentTime + delaySec;

  const source = context.createBufferSource();
  source.buffer = buffer;

  const gain = context.createGain();
  gain.gain.setValueAtTime(0, startAt);
  gain.gain.linearRampToValueAtTime(1, startAt + 0.05);

  source.connect(gain).connect(destination);
  source.start(startAt);
  playback.source = source;

  source.addEventListener("ended", () => {
    gain.disconnect();
    // A stopped playback was already replaced or cancelled
    if (current !== playback) return;

    const expectedEnd = playback.deadline + buffer.duration * 1000;
    logSound("ended", {
      lateMs: Math.round(Date.now() - expectedEnd),
      ...clockInfo(),
    });
    current = null;
    element.pause();
    void context.suspend();
  });
}

function stopCurrent(reason: string) {
  const playback = current;
  if (!playback) return;
  current = null;
  logSound("stop", { reason, remainingMs: playback.deadline - Date.now() });
  playback.source?.stop();

  if (reason === "cancel" && player) {
    player.element.pause();
    void player.context.suspend();
  }
}

function getPlayer() {
  if (player) return player;

  const context = new AudioContext();
  const destination = context.createMediaStreamDestination();
  const element = document.createElement("audio");
  element.srcObject = destination.stream;
  document.body.appendChild(element);
  player = { context, destination, element };

  context.addEventListener("statechange", () =>
    logSound("context state", clockInfo()),
  );
  for (const event of ["pause", "playing", "stalled", "suspend"]) {
    element.addEventListener(event, () =>
      logSound(`element ${event}`, clockInfo()),
    );
  }
  document.addEventListener("visibilitychange", () =>
    logSound(`page ${document.visibilityState}`, clockInfo()),
  );
  document.addEventListener("freeze", () => logSound("page freeze"));
  document.addEventListener("resume", () =>
    logSound("page resume", clockInfo()),
  );

  logSound("player created", { contextState: context.state });
  return player;
}

function loadBuffer(context: AudioContext) {
  if (!bufferPromise) {
    // The sound is inlined into the bundle, so no network or service worker is involved
    const base64 = SoundDataUrl.slice(SoundDataUrl.indexOf(",") + 1);
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    bufferPromise = context.decodeAudioData(bytes.buffer);
    bufferPromise.catch(() => {
      bufferPromise = null;
    });
  }
  return bufferPromise;
}

// driftMs > 0 means the audio clock fell behind real time (the page was throttled or frozen)
function clockInfo() {
  if (!player) return {};
  const { context, element } = player;
  const info: Record<string, unknown> = {
    contextState: context.state,
    elementPaused: element.paused,
  };
  if (current) {
    info.untilDeadlineMs = current.deadline - Date.now();
    info.driftMs = Math.round(
      Date.now() -
        current.anchorDate -
        (context.currentTime - current.anchorContextTime) * 1000,
    );
  }
  return info;
}

function round(value: number) {
  return Math.round(value * 10) / 10;
}
