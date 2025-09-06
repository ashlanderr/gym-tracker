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
  children?: ReactNode;
  onClose?: () => void;
  onSubmit?: () => void;
}
