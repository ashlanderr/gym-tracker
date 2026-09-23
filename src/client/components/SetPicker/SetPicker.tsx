import s from "./styles.module.scss";
import { Wheel } from "../Wheel";
import type { SetPickerProps } from "./types.ts";

// Two columns of one picker, the way an hour and a minute are: the set is a
// single answer, so both halves of it spin in one place.
export function SetPicker({
  weightRange,
  repsRange,
  weight,
  reps,
  weightUnits,
  formatWeight,
  onWeightChange,
  onRepsChange,
}: SetPickerProps) {
  return (
    <div className={s.root}>
      <div className={s.band} />
      <Wheel
        {...weightRange}
        value={weight}
        units={weightUnits}
        format={formatWeight}
        onChange={onWeightChange}
      />
      <div className={s.times}>×</div>
      <Wheel
        {...repsRange}
        value={reps}
        units="раз"
        format={String}
        onChange={onRepsChange}
      />
    </div>
  );
}
