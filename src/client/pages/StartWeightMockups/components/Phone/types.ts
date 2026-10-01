import type { ReactNode } from "react";

export interface PhoneProps {
  caption: string;
  note?: string;
  children: ReactNode;
  overlay?: ReactNode;
  // Screen size in CSS pixels, to see the same page on another phone.
  size?: { width: number; height: number };
}
