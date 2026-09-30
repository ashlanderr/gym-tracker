import type { SYMBOL_PARTS } from "./symbol.ts";

export type SymbolPart = keyof typeof SYMBOL_PARTS;

// A flat color, or a diagonal gradient from the top left corner.
export type Paint = string | readonly [string, string];

export interface IconColors {
  background: Paint;
  parts: Record<SymbolPart, Paint>;
}

export interface IconVariant extends IconColors {
  name: string;
  note: string;
}
