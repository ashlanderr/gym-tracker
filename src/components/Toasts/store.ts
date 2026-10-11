import type { ReactNode } from "react";
import { generateId } from "../../db";
import { TOAST_DURATION, TOAST_EXIT_DURATION } from "./constants.ts";
import type { Toast } from "./types.ts";

let toasts: Toast[] = [];
const listeners = new Set<() => void>();

function setToasts(update: (toasts: Toast[]) => Toast[]) {
  toasts = update(toasts);
  listeners.forEach((listener) => listener());
}

export function subscribeToasts(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getToasts(): Toast[] {
  return toasts;
}

export function showToast(content: ReactNode) {
  const id = generateId();
  setToasts((toasts) => [...toasts, { id, content, leaving: false }]);
  setTimeout(() => hideToast(id), TOAST_DURATION);
}

export function hideToast(id: string) {
  setToasts((toasts) =>
    toasts.map((t) => (t.id === id ? { ...t, leaving: true } : t)),
  );
  setTimeout(
    () => setToasts((toasts) => toasts.filter((t) => t.id !== id)),
    TOAST_EXIT_DURATION,
  );
}
