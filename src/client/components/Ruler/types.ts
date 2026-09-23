export interface RulerProps {
  min: number;
  max: number;
  step: number;
  // Ticks between two labelled ones.
  majorEvery: number;
  value: number;
  onChange: (value: number) => void;
}
