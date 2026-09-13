import type { Exercise, Performance, Set } from "../../../../db";
import type { RecSetData } from "../../../../domain";

export interface SetActionBottomSheetData {
  exercise: Exercise | null;
  performance: Performance;
  set: Set;
  recSet: RecSetData | undefined;
}
