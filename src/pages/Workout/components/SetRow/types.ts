import type { Set } from "../../../../db/sets.ts";
import type { SetData } from "../Performance/types.ts";
import type { Performance } from "../../../../db/performances.ts";
import type { Exercise } from "../../../../db/exercises.ts";

export interface SetRowProps {
  exercise: Exercise | null;
  performance: Performance;
  number: string;
  set: Set;
  prevSet: Set | undefined;
  recSet: SetData | undefined;
}
