import type { ReactNode } from "react";

export interface PageHeaderProps {
  kicker?: ReactNode;
  title?: ReactNode;
  right?: ReactNode;
  children?: ReactNode;
  onBack?: () => void;
  onTitleClick?: () => void;
}

export interface HeaderButtonProps {
  primary?: boolean;
  disabled?: boolean;
  children: ReactNode;
  onClick?: () => void;
}
