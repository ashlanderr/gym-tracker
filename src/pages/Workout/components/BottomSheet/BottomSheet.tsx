import type { BottomSheetProps } from "./types.ts";
import s from "./styles.module.scss";
import { createPortal } from "react-dom";
import { clsx } from "clsx";

export function BottomSheet({
  isOpen,
  hasBackdrop,
  children,
  onClose,
}: BottomSheetProps) {
  if (!isOpen) return null;

  return createPortal(
    <div
      className={clsx(s.root, hasBackdrop !== false && s.backdrop)}
      onClick={onClose}
    >
      <div className={s.modal} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    document.body,
  );
}
