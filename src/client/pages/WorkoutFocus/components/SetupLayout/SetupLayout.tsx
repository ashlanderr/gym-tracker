import s from "./styles.module.scss";
import { clsx } from "clsx";
import type { SetupLayoutProps } from "./types.ts";

// A page before the first set of an exercise: its name small, the question
// large, and the answer buttons where "Сделал" stands on the set screen.
export function SetupLayout({
  name,
  title,
  children,
  actions,
}: SetupLayoutProps) {
  return (
    <>
      <div className={s.header}>
        <div className={s.name}>{name}</div>
        {title && <div className={s.title}>{title}</div>}
      </div>
      <div className={s.body}>{children}</div>
      {actions.length !== 0 && (
        <div className={s.actions}>
          {actions.map((action) => (
            <button
              key={action.label}
              className={clsx(s.button, action.isPrimary && s.primary)}
              disabled={action.disabled}
              onClick={action.onClick}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
