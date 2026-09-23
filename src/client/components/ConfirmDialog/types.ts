import type { ReactNode } from "react";

export interface ConfirmDialogProps {
  title: string;
  children: ReactNode;
  submitLabel: string;
  waitSeconds?: number;
  onClose: () => void;
  onSubmit: () => void;
}
