import type { CompletedSet, Set } from "../../../../db/sets.ts";
import type { Performance } from "../../../../db/performances.ts";
import type { Exercise } from "../../../../db/exercises.ts";
import type { DraftSetData } from "../Performance/types.ts";

export interface SetRowProps {
  exercise: Exercise | null;
  performance: Performance;
  number: string;
  set: Set;
  prevSet: CompletedSet | undefined;
  recSet: DraftSetData | undefined;
}
