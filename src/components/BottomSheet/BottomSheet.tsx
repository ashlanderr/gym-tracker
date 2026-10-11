import type { BottomSheetProps } from "./types.ts";
import s from "./styles.module.scss";
import { createPortal } from "react-dom";
import { motion } from "motion/react";
import { SHEET_TRANSITION } from "./constants.ts";

export function BottomSheet({ children, onClose }: BottomSheetProps) {
  return createPortal(
    <motion.div
      className={s.root}
      initial={{ backgroundColor: "rgba(0, 0, 0, 0)" }}
      animate={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
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
    </motion.div>,
    document.body,
  );
}
