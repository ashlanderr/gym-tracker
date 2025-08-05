import type { ReactNode } from "react";

export interface ModalDialogProps {
  title: string;
  width?: string;
  cancelText?: string;
  cancelDisabled?: boolean;
  cancelColor?: string;
  submitText?: string;
  submitDisabled?: boolean;
  submitColor?: string;
  isOpen: boolean;
  children?: ReactNode;
  onClose?: () => void;
  onSubmit?: () => void;
}
