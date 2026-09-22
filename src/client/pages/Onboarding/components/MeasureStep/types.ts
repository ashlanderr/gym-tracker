import type { MeasureRange } from "../../types.ts";

export interface MeasureStepProps {
  question: string;
  note?: string;
  why?: string;
  range: MeasureRange;
  value: number;
  units: string;
  // Fixed for the whole scale: body weight that flips between "80" and "79.5"
  // moves the number under the thumb while it is being dragged.
  decimals: number;
  onChange: (value: number) => void;
  onNext: () => void;
}
