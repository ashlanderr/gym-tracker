import type { Performance, Exercise } from "../../../../db";

export interface PerformanceOrderProps {
  performances: Performance[];
  onCancel: () => void;
  onSubmit: (items: Performance[]) => void;
}

export interface OrderItem {
  performance: Performance;
  exercise: Exercise | null;
}
