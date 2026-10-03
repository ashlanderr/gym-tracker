import s from "./styles.module.scss";
import { BottomSheet } from "../../../../components";
import type { StepSheetProps } from "./types.ts";

export function StepSheet({
  title,
  value,
  units,
  onDecrease,
  onIncrease,
  onClose,
  children,
}: StepSheetProps) {
  return (
    <BottomSheet onClose={onClose}>
      <div className={s.root}>
        <div className={s.grip} />
        <div className={s.title}>{title}</div>
        <div className={s.stepper}>
          <button className={s.stepButton} onClick={onDecrease}>
            −
          </button>
          <div className={s.value}>
            {value}
            {units && <span className={s.units}>{units}</span>}
          </div>
          <button className={s.stepButton} onClick={onIncrease}>
            +
          </button>
        </div>
        {children}
      </div>
    </BottomSheet>
  );
}
