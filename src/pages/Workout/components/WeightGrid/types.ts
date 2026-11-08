export interface WeightGridProps {
  groups: number[][];
  excluded: number[];
  onToggle: (weight: number) => void;
}
