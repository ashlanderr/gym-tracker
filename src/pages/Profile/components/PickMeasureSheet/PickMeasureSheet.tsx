import s from "./styles.module.scss";
import { FormSheet, type ModalProps } from "../../../../components";
import type { MeasurementType } from "../../../../db";
import { MEASURES } from "../../constants.ts";
import type { PickMeasureSheetData } from "./types.ts";

// A measurement is tracked from its first record, so picking one here only
// opens its scale; closing the scale leaves it untracked.
export function PickMeasureSheet({
  data: { types },
  onCancel,
  onSubmit,
}: ModalProps<PickMeasureSheetData, MeasurementType>) {
  return (
    <FormSheet
      title="Новый замер"
      note="Появится в профиле после первой записи"
      onClose={onCancel}
    >
      <div className={s.list}>
        {types.map((type) => (
          <button key={type} className={s.item} onClick={() => onSubmit(type)}>
            {MEASURES[type].title}
          </button>
        ))}
      </div>
    </FormSheet>
  );
}
