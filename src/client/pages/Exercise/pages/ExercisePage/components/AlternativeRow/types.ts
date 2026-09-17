import type { ExerciseAlternative } from "../../../../../../db";

export interface AlternativeRowProps {
  alternative: ExerciseAlternative;
  onReplace: ((exercise: string) => void) | undefined;
}
