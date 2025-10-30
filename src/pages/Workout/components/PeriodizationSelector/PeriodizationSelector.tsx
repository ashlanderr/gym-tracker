import { BottomSheet, type ModalProps } from "../../../../components";
import type { PeriodizationOrNone } from "./types.ts";
import s from "./styles.module.scss";
import { clsx } from "clsx";
import { MODE_OPTIONS } from "./constants.ts";

export function PeriodizationSelector({
  onCancel,
  onSubmit,
}: ModalProps<null, PeriodizationOrNone>) {
  return (
    <BottomSheet isOpen={true} onClose={onCancel}>
      <div className={s.sheetHeader}>Режим тренировки</div>
      <div className={s.sheetActions}>
        {Object.entries(MODE_OPTIONS).map(([mode, option]) => (
          <button
            key={mode}
            className={clsx(s.modeAction, option.className)}
            onClick={() => onSubmit(mode as PeriodizationOrNone)}
          >
            <span className={clsx(s.modeLabel, option.className)}>
              {option.action}
            </span>
            <span className={s.modeDescription}>{option.description}</span>
          </button>
        ))}
      </div>
    </BottomSheet>
  );
}
