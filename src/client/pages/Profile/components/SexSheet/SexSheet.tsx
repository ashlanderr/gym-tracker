import s from "./styles.module.scss";
import { useEffect, useRef, useState } from "react";
import {
  FormSheet,
  type ModalProps,
  SexPicker,
  useStore,
} from "../../../../components";
import type { Sex } from "../../../../db";
import { changeSex } from "../../../../domain";
import { ADVANCE_DELAY } from "../../../Onboarding/constants.ts";

// As on the onboarding step, picking is the answer: the sheet keeps it at
// once and closes a beat later, once the pick has visibly landed.
export function SexSheet({ data, onCancel }: ModalProps<Sex, null>) {
  const store = useStore();
  const [value, setValue] = useState(data);
  const timerRef = useRef<number>(undefined);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const selectHandler = (sex: Sex) => {
    setValue(sex);
    changeSex(store, sex);
    timerRef.current = window.setTimeout(onCancel, ADVANCE_DELAY);
  };

  return (
    <FormSheet
      title="Пол"
      note="Стартовые веса и нормативы силы у мужчин и женщин разные"
      onClose={onCancel}
    >
      <SexPicker className={s.picker} value={value} onSelect={selectHandler} />
    </FormSheet>
  );
}
