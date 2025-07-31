import { useParams } from "react-router";
import { Timestamp } from "firebase/firestore";
import { useEffect, useState } from "react";

export function usePageParams<T>(): T {
  return useParams() as unknown as T;
}

export function useTimer(
  startedAt: Timestamp | undefined,
  completedAt: Timestamp | undefined,
): string {
  const [time, setTime] = useState(() =>
    buildTime(startedAt, completedAt ?? Timestamp.now()),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(buildTime(startedAt, completedAt ?? Timestamp.now()));
    });
    return () => {
      clearInterval(interval);
    };
  }, [startedAt, completedAt]);

  return time;
}

export function buildTime(
  startedAt: Timestamp | undefined,
  completedAt: Timestamp | undefined,
): string {
  if (!startedAt || !completedAt) return "";

  const delta = Math.floor(
    Math.max(completedAt.seconds - startedAt.seconds, 0),
  );
  const seconds = delta % 60;
  const minutes = Math.floor(delta / 60) % 60;
  const hours = Math.floor(delta / 3600);
  const parts: string[] = [];

  if (hours) parts.push(`${hours}h`);
  if (hours || minutes) parts.push(`${minutes}min`);
  if (hours || minutes || seconds) parts.push(`${seconds}s`);

  return parts.slice(0, 2).join(" ");
}
