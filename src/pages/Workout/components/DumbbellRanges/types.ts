import type { DumbbellWeights } from "../../../../db";

export interface DumbbellRangesProps {
  weights: DumbbellWeights;
  onChange: (weights: DumbbellWeights) => void;
}
