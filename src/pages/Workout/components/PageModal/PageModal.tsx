import type { PageModalProps } from "./types.ts";
import { createPortal } from "react-dom";
import s from "./styles.module.scss";

export function PageModal({ isOpen, children }: PageModalProps) {
  if (!isOpen) return null;
  return createPortal(<div className={s.modal}>{children}</div>, document.body);
}
