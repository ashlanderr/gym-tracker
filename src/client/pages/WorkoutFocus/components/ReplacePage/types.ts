import type { Exercise } from "../../../../db";
import type { SafeAlternative } from "../../../../domain";

export interface ReplacePageData {
  exercise: Exercise;
  alternatives: SafeAlternative[];
}
