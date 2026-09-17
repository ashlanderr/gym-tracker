import type { ReactNode } from "react";

export interface FocusMessageProps {
  icon?: ReactNode;
  title: string;
  details?: string;
  text?: string;
  action: string;
  onAction: () => void;
  secondary?: { label: string; onClick: () => void };
}
