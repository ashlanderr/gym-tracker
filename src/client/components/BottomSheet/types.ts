import type { ReactNode } from "react";

export interface BottomSheetProps {
  isOpen?: boolean;
  hasBackdrop?: boolean;
  children: ReactNode;
  onClose?: () => void;
}
