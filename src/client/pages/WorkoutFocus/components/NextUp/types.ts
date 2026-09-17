import type { Set } from "../../../../db";
import type { WorkoutStep } from "../../../../domain";

export interface NextUpProps {
  next: WorkoutStep;
  lastSet: Set | undefined;
}
