import type { Set } from "../../../../db/sets.ts";
import type { SetData } from "../Performance/types.ts";

export interface SetRowProps {
  number: string;
  set: Set;
  prevSet: Set | undefined;
  recSet: SetData | undefined;
}
