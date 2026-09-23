import { MeasurePicker } from "../../../../components";
import { StepLayout } from "../StepLayout";
import type { MeasureStepProps } from "./types.ts";

export function MeasureStep({
  question,
  note,
  why,
  onNext,
  ...picker
}: MeasureStepProps) {
  return (
    <StepLayout
      question={question}
      note={note}
      why={why}
      action={{ label: "Дальше", onClick: onNext }}
    >
      <MeasurePicker {...picker} />
    </StepLayout>
  );
}
