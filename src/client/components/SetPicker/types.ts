interface WheelRange {
  min: number;
  max: number;
  step: number;
}

export interface SetPickerProps {
  weightRange: WheelRange;
  repsRange: WheelRange;
  weight: number;
  reps: number;
  // Left out when the weight column spells its own unit in every row.
  weightUnits?: string;
  formatWeight: (value: number) => string;
  onWeightChange: (value: number) => void;
  onRepsChange: (value: number) => void;
}
