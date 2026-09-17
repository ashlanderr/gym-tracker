import s from "./styles.module.scss";
import type { FocusMessageProps } from "./types.ts";

export function FocusMessage({
  icon,
  title,
  details,
  text,
  action,
  onAction,
  secondary,
}: FocusMessageProps) {
  return (
    <>
      <div className={s.message}>
        {icon && <div className={s.icon}>{icon}</div>}
        <div className={s.title}>{title}</div>
        {details && <div className={s.details}>{details}</div>}
        {text && <div className={s.text}>{text}</div>}
      </div>
      <div className={s.action}>
        <button className={s.primary} onClick={onAction}>
          {action}
        </button>
        {secondary && (
          <button className={s.secondary} onClick={secondary.onClick}>
            {secondary.label}
          </button>
        )}
      </div>
    </>
  );
}
