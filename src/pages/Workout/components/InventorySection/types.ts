import type { ReactNode } from "react";

export interface InventorySectionProps {
  label: string;
  // Each line of a long hint starts on its own line.
  hint: ReactNode | ReactNode[];
  children?: ReactNode;
}
