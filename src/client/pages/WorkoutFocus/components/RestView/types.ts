import type { Set } from "../../../../db";
import type { WorkoutStep } from "../../../../domain";

export interface RestViewProps {
  next: WorkoutStep;
  seconds: number;
  lastSet: Set | undefined;
}
