import s from "./styles.module.scss";
import { StepLayout } from "../StepLayout";
import { Ruler } from "../Ruler";
import { formatNumber } from "../../utils.ts";
import type { MeasureStepProps } from "./types.ts";

// One number, and the scale that sets it. The keyboard is never opened: on a
// phone it covers half the screen to type three digits nobody is unsure about.
export function MeasureStep({
  question,
  note,
  why,
  range,
  value,
  units,
  decimals,
  onChange,
  onNext,
}: MeasureStepProps) {
  return (
    <StepLayout
      question={question}
      note={note}
      why={why}
      action={{ label: "Дальше", onClick: onNext }}
    >
      <div className={s.value}>
        {formatNumber(value, decimals)}
        <span className={s.units}>{units}</span>
      </div>
      <Ruler {...range} value={value} onChange={onChange} />
    </StepLayout>
  );
}
