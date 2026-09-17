import type { ModalDialogProps } from "./types.ts";
import s from "./styles.module.scss";
import { clsx } from "clsx";
import { motion } from "motion/react";
import { DIALOG_TRANSITION } from "./constants.ts";

export function ModalDialog({
  title,
  width,
  cancelText,
  cancelDisabled,
  cancelColor,
  submitText,
  submitDisabled,
  submitColor,
  children,
  onClose,
  onSubmit,
}: ModalDialogProps) {
  return (
    <motion.div
      className={s.backdrop}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={DIALOG_TRANSITION}
      onClick={onClose}
    >
      <motion.div
        className={s.modal}
        style={{ width }}
        initial={{ scale: 0.96 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.96 }}
        transition={DIALOG_TRANSITION}
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
      </motion.div>
    </motion.div>
  );
}
