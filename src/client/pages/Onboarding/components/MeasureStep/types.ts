import type { MeasurePickerProps } from "../../../../components";

export interface MeasureStepProps extends MeasurePickerProps {
  question: string;
  note?: string;
  why?: string;
  onNext: () => void;
}
