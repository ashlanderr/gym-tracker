import type { ReactNode } from "react";

export interface MockSet {
  number: string;
  prev: string;
  weight: string;
  reps: string;
  done?: boolean;
}

export interface MockExerciseProps {
  id: string;
  sets: MockSet[];
  thumbClassName?: string;
  // Drawn instead of the exercise picture.
  thumb?: ReactNode;
  // Only the header: for comparing pictures and names.
  isCompact?: boolean;
  // Drawn between the header and the table.
  notice?: ReactNode;
  // Replaces the weight in every set that is not done.
  weightCell?: ReactNode;
}
