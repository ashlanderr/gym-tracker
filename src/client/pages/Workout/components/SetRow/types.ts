import type {
  CompletedSet,
  Set,
  Performance,
  Exercise,
  RecordNumbers,
  RecordType,
  Gym,
} from "../../../../db";
import type { RecSetData } from "../../../../domain";

export interface SetRowProps {
  exercise: Exercise;
  gym: Gym;
  performance: Performance;
  number: string;
  set: Set;
  prevSet: CompletedSet | undefined;
  recSet: RecSetData | undefined;
}

export interface NewRecordData extends RecordNumbers {
  type: RecordType;
}
