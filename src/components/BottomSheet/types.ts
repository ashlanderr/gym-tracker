import type { ReactNode } from "react";

export interface BottomSheetProps {
  children: ReactNode;
  onClose?: () => void;
}
