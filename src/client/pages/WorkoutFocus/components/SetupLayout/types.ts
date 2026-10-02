import type { ReactNode } from "react";

export interface SetupAction {
  label: string;
  onClick: () => void;
  isPrimary?: boolean;
  disabled?: boolean;
}

export interface SetupLayoutProps {
  name: string;
  title?: string;
  children: ReactNode;
  actions: SetupAction[];
}
