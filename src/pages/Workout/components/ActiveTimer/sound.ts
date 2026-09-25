import SoundDataUrl from "./sound.mp3?inline";
import { logSound } from "../../../../utils";

type Player = {
  id: number;
  context: AudioContext;
  destination: MediaStreamAudioDestinationNode;
  element: HTMLAudioElement;
  source: AudioBufferSourceNode | null;
  noise: AudioBufferSourceNode;
  anchorDate: number;
  anchorContextTime: number;
};

type Playback = {
  deadline: number;
  player: Player;
};

// Uniform noise with this amplitude has an RMS level of about -60 dBFS
const NOISE_AMPLITUDE = 0.0017;

// Decoding doesn't depend on a playback context, so the buffer survives player re-creation
const bufferPromise = decodeSound();

let current: Playback | null = null;
let lastPlayerId = 0;
let pageListenersAdded = false;

export function scheduleSound(deadline: number) {
  stopCurrent("restart");
  addPageListeners();
  logSound("schedule", { delaySec: round((deadline - Date.now()) / 1000) });

  // A fresh player each time: after the page was frozen an old one may stay silent
  const playback: Playback = { deadline, player: createPlayer() };
  current = playback;
  startPlayback(playback);
}

export function cancelSound() {
  stopCurrent("cancel");
}

function startPlayback(playback: Playback) {
  const player = playback.player;
  const { context, element } = player;

  // Both calls happen synchronously inside the tap handler to keep the user activation
  context
    .resume()
    .catch((e) => logSound("resume failed", { error: String(e) }));
  element
    .play()
    .then(() => logSound("play ok", { player: player.id }))
    .catch((e) => logSound("play failed", { error: String(e) }));

  bufferPromise
    .then((buffer) => {
      if (current !== playback || playback.player !== player) return;
      startSource(playback, player, buffer);
    })
    .catch((e) => logSound("decode failed", { error: String(e) }));
}

function startSource(playback: Playback, player: Player, buffer: AudioBuffer) {
  const { context, destination } = player;
  const delaySec = Math.max(0, (playback.deadline - Date.now()) / 1000);
  const startAt = context.currentTime + delaySec;

  const source = context.createBufferSource();
  source.buffer = buffer;

  const gain = context.createGain();
  gain.gain.setValueAtTime(0, startAt);
  gain.gain.linearRampToValueAtTime(1, startAt + 0.05);

  source.connect(gain).connect(destination);
  source.start(startAt);
  player.source = source;
  player.noise.stop(startAt);

  source.addEventListener("ended", () => {
    // A stopped playback was already replaced or cancelled
    if (current !== playback || playback.player !== player) return;

    const expectedEnd = playback.deadline + buffer.duration * 1000;
    logSound("ended", {
      lateMs: Math.round(Date.now() - expectedEnd),
      ...clockInfo(),
    });
    current = null;
    closePlayer(player);
  });
}

function stopCurrent(reason: string) {
  const playback = current;
  if (!playback) return;
  current = null;
  logSound("stop", { reason, remainingMs: playback.deadline - Date.now() });
  closePlayer(playback.player);
}

// The audio clock stops while the page is frozen, so the scheduled sound would be late or silent
function resyncAfterPause() {
  const playback = current;
  if (!playback) return;

  const { player } = playback;
  const drift = driftMs(player);
  if (Math.abs(drift) < 1000 && !player.element.paused) return;

  if (playback.deadline <= Date.now()) {
    stopCurrent("missed");
    return;
  }

  logSound("resync", { driftMs: drift, elementPaused: player.element.paused });
  playback.player = createPlayer();
  closePlayer(player);
  startPlayback(playback);
}

function createPlayer(): Player {
  const context = new AudioContext();
  const destination = context.createMediaStreamDestination();
  const element = document.createElement("audio");
  element.srcObject = destination.stream;
  document.body.appendChild(element);

  const player: Player = {
    id: ++lastPlayerId,
    context,
    destination,
    element,
    source: null,
    noise: startNoise(context, destination),
    anchorDate: Date.now(),
    anchorContextTime: context.currentTime,
  };

  context.addEventListener("statechange", () => {
    if (current?.player === player) logSound("context state", clockInfo());
  });
  for (const event of ["pause", "playing", "stalled", "suspend"]) {
    element.addEventListener(event, () => {
      if (current?.player === player) {
        logSound(`element ${event}`, clockInfo());
      }
    });
  }

  logSound("player created", { player: player.id, contextState: context.state });
  return player;
}

// Chrome freezes a hidden page after about a minute unless it is audible, and pure silence
// doesn't count. Noise at about -60 dBFS passes Chrome's silence threshold (about -72 dBFS)
// but can't be heard.
function startNoise(context: AudioContext, destination: AudioNode) {
  const buffer = context.createBuffer(1, context.sampleRate, context.sampleRate);
  const samples = buffer.getChannelData(0);
  for (let i = 0; i < samples.length; i++) {
    samples[i] = (Math.random() * 2 - 1) * NOISE_AMPLITUDE;
  }

  const noise = context.createBufferSource();
  noise.buffer = buffer;
  noise.loop = true;
  noise.connect(destination);
  noise.start();
  return noise;
}

function closePlayer(player: Player) {
  player.source?.stop();
  player.element.pause();
  player.element.srcObject = null;
  player.element.remove();
  void player.context.close();
}

function addPageListeners() {
  if (pageListenersAdded) return;
  pageListenersAdded = true;

  document.addEventListener("visibilitychange", () => {
    logSound(`page ${document.visibilityState}`, clockInfo());
    if (document.visibilityState === "visible") resyncAfterPause();
  });
  document.addEventListener("freeze", () => logSound("page freeze"));
  document.addEventListener("resume", () => {
    logSound("page resume", clockInfo());
    resyncAfterPause();
  });
}

async function decodeSound() {
  // The sound is inlined into the bundle, so no network or service worker is involved
  const base64 = SoundDataUrl.slice(SoundDataUrl.indexOf(",") + 1);
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  const context = new OfflineAudioContext(1, 1, 44100);
  return context.decodeAudioData(bytes.buffer);
}

// driftMs > 0 means the audio clock fell behind real time (the page was throttled or frozen)
function driftMs(player: Player) {
  return Math.round(
    Date.now() -
      player.anchorDate -
      (player.context.currentTime - player.anchorContextTime) * 1000,
  );
}

function clockInfo() {
  if (!current) return {};
  const { player, deadline } = current;
  return {
    player: player.id,
    contextState: player.context.state,
    elementPaused: player.element.paused,
    untilDeadlineMs: deadline - Date.now(),
    driftMs: driftMs(player),
  };
}

function round(value: number) {
  return Math.round(value * 10) / 10;
}
