import type { ReactNode } from "react";

export interface StepAction {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export interface StepLayoutProps {
  icon?: ReactNode;
  question: string;
  note?: string;
  why?: string;
  text?: string;
  children?: ReactNode;
  hint?: string;
  action?: StepAction;
  secondary?: StepAction;
}
