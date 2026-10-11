import s from "./styles.module.scss";
import { clsx } from "clsx";
import { BottomSheet, type ModalProps } from "../../../../components";
import { buildTime } from "../../../hooks.ts";
import { TIMER_OPTIONS } from "./constants.ts";
import type { RestTimerSheetData } from "./types.ts";

export function RestTimerSheet({
  data,
  onCancel,
  onSubmit,
}: ModalProps<RestTimerSheetData, number>) {
  return (
    <BottomSheet onClose={onCancel}>
      <div className={s.sheetHeader}>Таймер отдыха</div>
      <div className={s.sheetSelector}>
        {TIMER_OPTIONS.map((t) => (
          <button
            className={clsx(s.sheetOption, t === data.current && s.selected)}
            key={t}
            onClick={() => onSubmit(t)}
          >
            {t ? buildTime(0, t * 1000) : "ВЫКЛ"}
          </button>
        ))}
      </div>
    </BottomSheet>
  );
}
