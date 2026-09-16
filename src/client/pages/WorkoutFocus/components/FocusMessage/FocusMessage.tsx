import s from "./styles.module.scss";
import type { FocusMessageProps } from "./types.ts";

export function FocusMessage({ text, action, onAction }: FocusMessageProps) {
  return (
    <>
      <div className={s.message}>{text}</div>
      <div className={s.action}>
        <button className={s.primary} onClick={onAction}>
          {action}
        </button>
      </div>
    </>
  );
}
