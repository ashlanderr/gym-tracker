import type { RepRange } from "../../../../domain";

export interface RepsPickerProps {
  center: number;
  selected: number | undefined;
  target: RepRange | undefined;
  onPick: (reps: number) => void;
}
