export interface RulerProps {
  min: number;
  max: number;
  step: number;
  // Ticks between two labelled ones.
  majorEvery: number;
  value: number;
  // A vertical scale fills the height of its container.
  axis?: "x" | "y";
  format?: (value: number) => string;
  onChange: (value: number) => void;
}
