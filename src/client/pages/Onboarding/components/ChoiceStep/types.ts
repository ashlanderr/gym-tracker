import type { ChoiceOption } from "../../types.ts";

export interface ChoiceStepProps<T extends string> {
  question: string;
  note?: string;
  why?: string;
  options: ChoiceOption<T>[];
  value: T | undefined;
  onSelect: (value: T) => void;
}
