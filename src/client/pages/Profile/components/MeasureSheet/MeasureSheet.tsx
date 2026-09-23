import { useState } from "react";
import { useAccountId } from "../../../../account";
import {
  FormSheet,
  MeasurePicker,
  type ModalProps,
  useStore,
} from "../../../../components";
import { addMeasurement, generateId } from "../../../../db";
import { MEASURES } from "../../constants.ts";
import type { MeasureSheetData } from "./types.ts";

// Always a new record, never a correction of the last one: the history is
// the point of measuring. A mistake is deleted on the history page.
export function MeasureSheet({
  data: { type, value: initial },
  onCancel,
  onSubmit,
}: ModalProps<MeasureSheetData, null>) {
  const store = useStore();
  const accountId = useAccountId();
  const [value, setValue] = useState(initial);
  const { title, units, decimals, range } = MEASURES[type];

  const saveHandler = () => {
    addMeasurement(store, {
      id: generateId(),
      user: accountId,
      type,
      value,
      createdAt: Date.now(),
    });
    void onSubmit(null);
  };

  return (
    <FormSheet
      title={title}
      note="Прошлые записи останутся в истории"
      action={{ label: "Записать", onClick: saveHandler }}
      onClose={onCancel}
    >
      <MeasurePicker
        range={range}
        value={value}
        units={units}
        decimals={decimals}
        onChange={setValue}
      />
    </FormSheet>
  );
}
