export interface WheelProps {
  min: number;
  max: number;
  step: number;
  value: number;
  // Stands still beside the column, because it labels the picked row only.
  units?: string;
  format: (value: number) => string;
  onChange: (value: number) => void;
}
