import type { ReactNode } from "react";

export interface BottomSheetProps {
  isOpen: boolean;
  children: ReactNode;
  onClose: () => void;
}
