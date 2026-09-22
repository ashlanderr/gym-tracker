import type { Sex } from "../../types.ts";

export interface SexStepProps {
  value: Sex | undefined;
  onSelect: (value: Sex) => void;
}
