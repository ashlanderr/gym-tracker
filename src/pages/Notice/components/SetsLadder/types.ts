import type { RepRange } from "../../../../domain";

export interface LadderSet {
  weight: number;
  reps: number;
}

export interface SetsLadderProps {
  sets: LadderSet[];
  range: RepRange;
  today: number;
  formatWeight: (weightKg: number) => string;
}
