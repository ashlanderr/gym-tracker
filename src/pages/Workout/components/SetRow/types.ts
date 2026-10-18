import type {
  CompletedSet,
  Set,
  Performance,
  Exercise,
  RecordNumbers,
  RecordType,
  WeightUnits,
} from "../../../../db";
import type { RecSetData } from "../../../../domain";

export interface SetRowProps {
  exercise: Exercise | null;
  performance: Performance;
  units: WeightUnits;
  number: string;
  set: Set;
  prevSet: CompletedSet | undefined;
  recSet: RecSetData | undefined;
  startsRest: boolean;
  isNext: boolean;
}

export interface SetSheetData {
  performance: Performance;
  setId: string;
}

export interface NewRecordData extends RecordNumbers {
  type: RecordType;
}
