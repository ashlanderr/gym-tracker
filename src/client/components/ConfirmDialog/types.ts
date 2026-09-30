import type { ReactNode } from "react";

export interface ConfirmDialogProps {
  title: string;
  children: ReactNode;
  submitLabel: string;
  waitSeconds?: number;
  // Red line above the buttons; by default the action is irreversible.
  warning?: string | null;
  onClose: () => void;
  onSubmit: () => void;
}
