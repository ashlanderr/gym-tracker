import type {
  CompletedSet,
  Set,
  Performance,
  Exercise,
  RecordNumbers,
  RecordType,
} from "../../../../db";
import type { RecSetData } from "../../../../domain";

export interface SetRowProps {
  exercise: Exercise | null;
  performance: Performance;
  number: string;
  set: Set;
  prevSet: CompletedSet | undefined;
  recSet: RecSetData | undefined;
  readonly?: boolean;
}

export interface NewRecordData extends RecordNumbers {
  type: RecordType;
}
