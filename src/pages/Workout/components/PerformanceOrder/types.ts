import type { Exercise, Performance } from "../../../../db";

export interface OrderItem {
  performance: Performance;
  exercise: Exercise | null;
}
