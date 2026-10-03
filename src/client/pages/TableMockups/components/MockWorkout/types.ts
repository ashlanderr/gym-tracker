export type MockLayout = "page" | "cards" | "inset";

export type MockInventory = "between" | "strip";

export interface MockWorkoutProps {
  workoutId: string;
  layout: MockLayout;
  // Pills around the weight and the reps and a round check.
  hasPills?: boolean;
  inventory?: MockInventory;
}
