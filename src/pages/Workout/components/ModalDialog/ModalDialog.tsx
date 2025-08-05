import type { ModalDialogProps } from "./types.ts";
import s from "./styles.module.scss";
import { clsx } from "clsx";

export function ModalDialog({
  title,
  width,
  cancelText,
  cancelDisabled,
  cancelColor,
  submitText,
  submitDisabled,
  submitColor,
  isOpen,
  children,
  onClose,
  onSubmit,
}: ModalDialogProps) {
  if (!isOpen) return null;
  return (
    <div className={s.backdrop} onClick={onClose}>
      <div
        className={s.modal}
        style={{ width }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={s.title}>{title}</div>
        <div className={s.body}>{children}</div>
        <div className={s.actions}>
          {cancelText && (
            <button
              className={clsx(s.action, s.cancel)}
              disabled={cancelDisabled}
              style={{ backgroundColor: cancelColor }}
              onClick={onClose}
            >
              {cancelText}
            </button>
          )}
          {submitText && (
            <button
              className={clsx(s.action, s.submit)}
              disabled={submitDisabled}
              style={{ backgroundColor: submitColor }}
              onClick={onSubmit}
            >
              {submitText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
