import type { Performance, Set } from "../../../../db";
import type { PerformanceStatus } from "../../../../domain";

// Locked is not kept anywhere either: an exercise waits while another one
// is in progress.
export type ExerciseCardStatus = PerformanceStatus | "locked";

export interface ExerciseCardProps {
  performance: Performance;
  sets: Set[];
  status: ExerciseCardStatus;
  highlight?: "done" | "open";
  onClick?: () => void;
}
