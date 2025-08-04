import type { Performance } from "../../../../db/performances.ts";
import type { Exercise } from "../../../../db/exercises.ts";

export interface PerformanceOrderProps {
  performances: Performance[];
  onCancel: () => void;
  onSubmit: (items: Performance[]) => void;
}

export interface OrderItem {
  performance: Performance;
  exercise: Exercise | null;
}
