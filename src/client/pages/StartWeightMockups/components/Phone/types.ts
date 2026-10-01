import type { ReactNode } from "react";

export interface PhoneProps {
  caption: string;
  note?: string;
  children: ReactNode;
  overlay?: ReactNode;
}
