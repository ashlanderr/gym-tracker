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

export function buildTime(
  startedAt: Date | number | null,
  completedAt: Date | number | null,
): string {
  if (startedAt === null || completedAt === null) return "";

  const delta = Math.floor(
    Math.max(completedAt.valueOf() / 1000 - startedAt.valueOf() / 1000, 0),
  );
  const seconds = delta % 60;
  const minutes = Math.floor(delta / 60) % 60;
  const hours = Math.floor(delta / 3600);
  const parts: string[] = [];

  if (hours) parts.push(`${hours}h`);
  if (hours || minutes) parts.push(`${minutes}min`);
  if (hours || minutes || seconds) parts.push(`${seconds}s`);

  return parts.slice(0, 2).join(" ") || "0s";
}
