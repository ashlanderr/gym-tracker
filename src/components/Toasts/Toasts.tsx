import s from "./styles.module.scss";
import { createPortal } from "react-dom";
import { useSyncExternalStore } from "react";
import { clsx } from "clsx";
import { getToasts, hideToast, subscribeToasts } from "./store.ts";

export function Toasts() {
  const items = useSyncExternalStore(subscribeToasts, getToasts);

  return createPortal(
    <div className={s.root}>
      {items.map((toast) => (
        <div
          key={toast.id}
          className={clsx(s.toast, toast.leaving && s.leaving)}
          onClick={() => hideToast(toast.id)}
        >
          {toast.content}
        </div>
      ))}
    </div>,
    document.body,
  );
}
