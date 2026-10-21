import type { ReactNode } from "react";

export interface PageHeaderProps {
  kicker?: ReactNode;
  title?: ReactNode;
  right?: ReactNode;
  children?: ReactNode;
  // The title at the start instead of the middle, for a page with no way back.
  start?: boolean;
  onBack?: () => void;
  onTitleClick?: () => void;
}

export interface HeaderButtonProps {
  primary?: boolean;
  disabled?: boolean;
  children: ReactNode;
  onClick?: () => void;
}
