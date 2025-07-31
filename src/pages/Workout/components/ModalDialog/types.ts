import type { ReactNode } from "react";

export interface ModalDialogProps {
  title: string;
  width?: string;
  cancelText?: string;
  cancelDisabled?: boolean;
  submitText?: string;
  submitDisabled?: boolean;
  isOpen: boolean;
  children?: ReactNode;
  onClose?: () => void;
  onSubmit?: () => void;
}
