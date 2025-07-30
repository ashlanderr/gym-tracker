import type { BottomSheetProps } from "./types.ts";
import s from "./styles.module.scss";
import { createPortal } from "react-dom";

export function BottomSheet({ isOpen, children, onClose }: BottomSheetProps) {
  if (!isOpen) return null;

  return createPortal(
    <div className={s.backdrop} onClick={onClose}>
      <div className={s.modal} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    document.body,
  );
}
