import type { Performance } from "../../../../db";

export interface PerformanceProps {
  performance: Performance;
  title?: string;
  readonly?: boolean;
  onShowActions?: () => void;
}
