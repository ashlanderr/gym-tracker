import type { ReactNode } from "react";

export interface StepSheetProps {
  title: string;
  value: string;
  units?: string;
  onDecrease: () => void;
  onIncrease: () => void;
  onClose: () => void;
  children?: ReactNode;
}
