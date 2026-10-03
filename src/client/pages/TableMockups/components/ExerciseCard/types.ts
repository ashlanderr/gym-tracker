import type { ReactNode } from "react";
import type { MockSet } from "../SetLine";

export interface ExerciseCardProps {
  id: string;
  // "3 × 6–8 · отдых 2:00".
  plan: string;
  sets: MockSet[];
  isFinding?: boolean;
  // What the gym inventory lacks, as a request.
  inventory?: string;
  // Folded to one line once every set is done.
  isCollapsed?: boolean;
  summary?: string;
  thumbClassName?: string;
  // Drawn instead of the exercise picture.
  thumb?: ReactNode;
  // Only the header: for comparing pictures and names.
  isHeaderOnly?: boolean;
}
