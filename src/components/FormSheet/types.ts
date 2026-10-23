import type { ReactNode } from "react";

interface SheetAction {
  label: string;
  onClick: () => void;
}

export interface FormSheetProps {
  title: string;
  note?: string;
  children: ReactNode;
  action?: SheetAction;
  secondary?: SheetAction;
  onClose: () => void;
}
