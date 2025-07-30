import type { Set } from "../../../../db/sets.ts";

export interface SetRowProps {
  number: string;
  set: Set;
  prevSet: Set | undefined;
  recSet: Set | undefined;
}
