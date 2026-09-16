import type { Performance } from "../../../../db";

export interface PerformanceProps {
  performance: Performance;
  currentSet: string | undefined;
}
