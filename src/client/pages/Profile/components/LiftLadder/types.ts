import type { LiftRow } from "../../types.ts";

export interface LiftLadderProps {
  rows: LiftRow[];
  onSelect: (row: LiftRow) => void;
}
