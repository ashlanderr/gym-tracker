import type { RepRange, SetStep } from "../../../../domain";

export interface LastTimeStoryProps {
  steps: SetStep[];
  range: RepRange;
  formatWeight: (weightKg: number) => string;
}
