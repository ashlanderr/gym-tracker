import s from "./styles.module.scss";
import { useState } from "react";
import { ModalDialog, type ModalProps } from "../../../../components";
import { kgToUnits, unitsToKg } from "../../../../domain";
import { UNITS_SHORT } from "../../../constants.ts";
import { formatNumber } from "../../hooks.ts";
import type { ManualWeightData } from "./types.ts";

export function ManualWeightModal({
  data,
  onCancel,
  onSubmit,
}: ModalProps<ManualWeightData, number>) {
  const { units, weightKg } = data;
  const [value, setValue] = useState(() =>
    weightKg !== undefined ? formatNumber(kgToUnits(weightKg, units)) : "",
  );

  const parsed = Number.parseFloat(value.replace(",", "."));
  const isValid = Number.isFinite(parsed) && parsed >= 0;

  const submitHandler = () => {
    if (isValid) onSubmit(unitsToKg(parsed, units));
  };

  return (
    <ModalDialog
      title="Вес"
      width="300px"
      cancelText="Отмена"
      submitText="Готово"
      submitDisabled={!isValid}
      onClose={onCancel}
      onSubmit={submitHandler}
    >
      <label className={s.label}>Вес, {UNITS_SHORT[units]}</label>
      <input
        className={s.input}
        type="text"
        inputMode="decimal"
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={(e) => e.target.select()}
      />
    </ModalDialog>
  );
}
