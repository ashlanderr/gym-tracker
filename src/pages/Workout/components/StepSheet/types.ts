import type { ReactNode } from "react";

export interface SheetActionProps {
  children: ReactNode;
  isPrimary?: boolean;
  onClick: () => void;
}

export interface StepSheetProps {
  title: string;
  value: string;
  units?: string;
  actions?: ReactNode;
  children?: ReactNode;
  onDecrease: () => void;
  onIncrease: () => void;
  onClose: () => void;
}
