import { useParams } from "react-router";
import { useEffect, useState } from "react";

export function usePageParams<T>(): T {
  return useParams() as unknown as T;
}

export function useTimer(
  startedAt: Date | number | null,
  completedAt: Date | number | null,
): string {
  const [time, setTime] = useState(() =>
    buildTime(startedAt, completedAt ?? Date.now()),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(buildTime(startedAt, completedAt ?? Date.now()));
    });
    return () => {
      clearInterval(interval);
    };
  }, [startedAt, completedAt]);

  return time;
}

// A running clock as on a stopwatch, 12:05 or 1:02:03.
export function useClock(
  startedAt: number | null,
  completedAt: number | null,
): string {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (completedAt !== null) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [completedAt]);

  if (startedAt === null) return "";
  return formatClock(((completedAt ?? now) - startedAt) / 1000);
}

export function formatClock(totalSeconds: number): string {
  const { seconds, minutes, hours } = buildTimeParts(
    Math.max(0, Math.floor(totalSeconds)),
  );
  const ss = seconds.toString().padStart(2, "0");

  return hours
    ? `${hours}:${minutes.toString().padStart(2, "0")}:${ss}`
    : `${minutes}:${ss}`;
}

export function buildTime(
  startedAt: Date | number | null,
  completedAt: Date | number | null,
): string {
  if (startedAt === null || completedAt === null) return "";

  const delta = Math.floor(
    Math.max(completedAt.valueOf() / 1000 - startedAt.valueOf() / 1000, 0),
  );
  const { seconds, minutes, hours } = buildTimeParts(delta);
  const parts: string[] = [];

  if (hours) parts.push(`${hours}h`);
  if (hours || minutes) parts.push(`${minutes}min`);
  if (hours || minutes || seconds) parts.push(`${seconds}s`);

  return parts.slice(0, 2).join(" ") || "0s";
}

export function buildTimeParts(deltaSeconds: number) {
  const seconds = deltaSeconds % 60;
  const minutes = Math.floor(deltaSeconds / 60) % 60;
  const hours = Math.floor(deltaSeconds / 3600);
  return { seconds, minutes, hours };
}
