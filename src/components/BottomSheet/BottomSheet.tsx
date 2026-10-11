import type { BottomSheetProps } from "./types.ts";
import s from "./styles.module.scss";
import { createPortal } from "react-dom";
import { clsx } from "clsx";
import { AnimatePresence, motion } from "motion/react";
import { SHEET_TRANSITION } from "./constants.ts";

// Slides in and out. Closing either flips isOpen or removes the modal from
// the stack, whose presence propagates down here.
export function BottomSheet({
  isOpen,
  hasBackdrop,
  children,
  onClose,
}: BottomSheetProps) {
  const withBackdrop = hasBackdrop !== false;

  return createPortal(
    <AnimatePresence propagate>
      {isOpen !== false && (
        <motion.div
          key="sheet"
          className={clsx(s.root, withBackdrop && s.backdrop)}
          initial={{ backgroundColor: "rgba(0, 0, 0, 0)" }}
          animate={{
            backgroundColor: withBackdrop
              ? "rgba(0, 0, 0, 0.6)"
              : "rgba(0, 0, 0, 0)",
          }}
          exit={{ backgroundColor: "rgba(0, 0, 0, 0)" }}
          transition={SHEET_TRANSITION}
          onClick={onClose}
        >
          <motion.div
            className={s.modal}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={SHEET_TRANSITION}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
