import type { Exercise, Gym, Set } from "../../../../db";
import type { RecSetData } from "../../../../domain";

export interface SetActionBottomSheetData {
  exercise: Exercise;
  gym: Gym;
  set: Set;
  recSet: RecSetData | undefined;
}
