import type { CompletedSet, Set, Performance, Exercise } from "../../../../db";
import type { DraftSetData } from "../../../../domain";

export interface SetRowProps {
  exercise: Exercise | null;
  performance: Performance;
  number: string;
  set: Set;
  prevSet: CompletedSet | undefined;
  recSet: DraftSetData | undefined;
}
