import s from "./styles.module.scss";
import { BottomSheet } from "../BottomSheet";
import type { FormSheetProps } from "./types.ts";

// A sheet that changes one thing: what it is, a line on what happens to it,
// the control, and the button that keeps the change. Closing it any other way
// keeps nothing.
export function FormSheet({
  title,
  note,
  children,
  action,
  secondary,
  onClose,
}: FormSheetProps) {
  return (
    <BottomSheet onClose={onClose}>
      <div className={s.root}>
        <div className={s.grip} />
        <div className={s.title}>{title}</div>
        {note && <div className={s.note}>{note}</div>}
        <div className={s.body}>{children}</div>
        {(action || secondary) && (
          <div className={s.actions}>
            {action && (
              <button className={s.primary} onClick={action.onClick}>
                {action.label}
              </button>
            )}
            {secondary && (
              <button className={s.secondary} onClick={secondary.onClick}>
                {secondary.label}
              </button>
            )}
          </div>
        )}
      </div>
    </BottomSheet>
  );
}
