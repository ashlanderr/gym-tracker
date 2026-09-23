import s from "./styles.module.scss";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { DIALOG_TRANSITION } from "../ModalDialog/constants.ts";
import type { ConfirmDialogProps } from "./types.ts";

// A question before something that cannot be undone. The red button repeats
// the verb of the title; a wait, when there is one, keeps it asleep long
// enough to read what goes, and counts down on the button itself.
export function ConfirmDialog({
  title,
  children,
  submitLabel,
  waitSeconds = 0,
  onClose,
  onSubmit,
}: ConfirmDialogProps) {
  const [left, setLeft] = useState(waitSeconds);

  useEffect(() => {
    if (left <= 0) return;
    const timer = window.setTimeout(() => setLeft(left - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [left]);

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
        className={s.dialog}
        role="alertdialog"
        aria-label={title}
        initial={{ scale: 0.96 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.96 }}
        transition={DIALOG_TRANSITION}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={s.title}>{title}</div>
        <div className={s.body}>{children}</div>
        <div className={s.warning}>Отменить нельзя</div>
        <div className={s.actions}>
          <button className={s.cancel} onClick={onClose}>
            Отмена
          </button>
          <button className={s.submit} disabled={left > 0} onClick={onSubmit}>
            {left > 0 ? `${submitLabel} · ${left}` : submitLabel}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
