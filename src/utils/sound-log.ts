const STORAGE_KEY = "soundLog";
const MAX_ENTRIES = 500;

type SoundLogEntry = {
  time: number;
  event: string;
  data?: Record<string, unknown>;
};

export function logSound(event: string, data?: Record<string, unknown>) {
  console.info("[sound]", event, data ?? "");
  try {
    const entries = readSoundLog();
    entries.push({ time: Date.now(), event, data });
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(entries.slice(-MAX_ENTRIES)),
    );
  } catch {
    // Logging must never break the timer
  }
}

function readSoundLog(): SoundLogEntry[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function formatSoundLog() {
  return readSoundLog()
    .map(({ time, event, data }) => {
      const date = new Date(time);
      const day = date.toLocaleDateString("sv");
      const clock = date.toLocaleTimeString("sv");
      const ms = date.getMilliseconds().toString().padStart(3, "0");
      const details = data ? ` ${JSON.stringify(data)}` : "";
      return `${day} ${clock}.${ms} ${event}${details}`;
    })
    .join("\n");
}
