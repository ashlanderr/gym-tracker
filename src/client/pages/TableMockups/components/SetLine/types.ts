export type SetState = "done" | "current" | "next";

export interface MockSet {
  type: "warm-up" | "working";
  state: SetState;
  // The same set last time, "60 × 8".
  prev?: string;
  // Empty while the inventory is unknown.
  weight?: string;
  reps: string;
  // Recommended rather than entered: drawn muted until it is done.
  isSuggested?: boolean;
  isRecord?: boolean;
  // Why the weight changed, under the set.
  reason?: string;
}

export interface SetLineProps {
  set: MockSet;
  number: number;
}
