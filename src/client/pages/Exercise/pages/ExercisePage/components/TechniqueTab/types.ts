import type { Exercise } from "../../../../../../db";

export interface TechniqueTabProps {
  exercise: Exercise;
  onReplace: ((exercise: string) => void) | undefined;
}
