import type { Exercise } from "../../../../db";
import type { FormattedWeight } from "../../hooks.ts";

export interface WarningViewProps {
  exercise: Exercise;
  minimum: FormattedWeight;
  onReplace: () => void;
  onKeep: () => void;
}
