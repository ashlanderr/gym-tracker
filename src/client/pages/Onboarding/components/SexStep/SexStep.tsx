import { SexPicker } from "../../../../components";
import { QUESTIONS } from "../../questions.ts";
import { StepLayout } from "../StepLayout";
import type { SexStepProps } from "./types.ts";

export function SexStep({ value, onSelect }: SexStepProps) {
  return (
    <StepLayout {...QUESTIONS.sex}>
      <SexPicker value={value} onSelect={onSelect} />
    </StepLayout>
  );
}
