import type { Performance, Set } from "../../../../db";
import type { PerformanceStatus } from "../../../../domain";

// Locked is not kept anywhere either: an exercise waits for the unfinished
// ones above it that work the same muscles.
export type ExerciseCardStatus = PerformanceStatus | "locked";

export interface ExerciseCardProps {
  performance: Performance;
  sets: Set[];
  status: ExerciseCardStatus;
  highlight?: "done" | "open";
  onClick?: () => void;
}
