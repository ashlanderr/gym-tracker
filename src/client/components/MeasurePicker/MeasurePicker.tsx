import s from "./styles.module.scss";
import { Ruler } from "../Ruler";
import type { MeasurePickerProps } from "./types.ts";

// One number, and the scale that sets it. The keyboard is never opened: on a
// phone it covers half the screen to type three digits nobody is unsure about.
export function MeasurePicker({
  range,
  value,
  units,
  decimals,
  onChange,
}: MeasurePickerProps) {
  return (
    <>
      <div className={s.value}>
        {value.toLocaleString("ru", {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })}
        <span className={s.units}>{units}</span>
      </div>
      <Ruler {...range} value={value} onChange={onChange} />
    </>
  );
}
