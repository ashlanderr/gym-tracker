import type { Performance } from "../../../../db/performances.ts";
import type { SetType } from "../../../../db/sets.ts";

export interface PerformanceProps {
  performance: Performance;
}

export interface WorkingVolume {
  weight: number;
  reps: number;
  oneRepMax: number;
}

export interface SetData {
  type: SetType;
  weight: number;
  reps: number;
}
