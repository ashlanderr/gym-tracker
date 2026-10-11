import type { ReactNode } from "react";

export interface Toast {
  id: string;
  content: ReactNode;
  leaving: boolean;
}
