import { ModalDialog, type ModalProps } from "../../../../components";
import type { ExerciseRepRangeCustom } from "../../../../db";
import { useState } from "react";
import s from "./styles.module.scss";

export function CustomRepsModal({
  data,
  onCancel,
  onSubmit,
}: ModalProps<ExerciseRepRangeCustom | null, ExerciseRepRangeCustom>) {
  const [min, setMin] = useState(() => data?.min.toString() ?? "");
  const [max, setMax] = useState(() => data?.max.toString() ?? "");

  const minReps = parseReps(min);
  const maxReps = parseReps(max);

  const invalidNumber =
    (min !== "" && minReps === undefined) ||
    (max !== "" && maxReps === undefined);
  const invalidOrder =
    minReps !== undefined && maxReps !== undefined && minReps >= maxReps;

  const error = invalidNumber
    ? "Повторения должны быть целыми числами больше нуля"
    : invalidOrder
      ? "Минимум должен быть меньше максимума"
      : undefined;

  const disabled = minReps === undefined || maxReps === undefined || !!error;

  const submitHandler = () => {
    if (minReps === undefined || maxReps === undefined) return;
    if (error) return;
    onSubmit({ min: minReps, max: maxReps });
  };

  return (
    <ModalDialog
      title="Диапазон повторений"
      width="300px"
      cancelText="Отмена"
      submitText="Готово"
      submitDisabled={disabled}
      onClose={onCancel}
      onSubmit={submitHandler}
    >
      <div className={s.fields}>
        <div className={s.field}>
          <label className={s.label}>Минимум</label>
          <input
            className={s.input}
            type="number"
            inputMode="numeric"
            value={min}
            onChange={(e) => setMin(e.target.value)}
          />
        </div>
        <div className={s.field}>
          <label className={s.label}>Максимум</label>
          <input
            className={s.input}
            type="number"
            inputMode="numeric"
            value={max}
            onChange={(e) => setMax(e.target.value)}
          />
        </div>
      </div>
      {error && <div className={s.error}>{error}</div>}
    </ModalDialog>
  );
}

function parseReps(value: string): number | undefined {
  const trimmed = value.trim();
  if (!/^\d+$/.test(trimmed)) return undefined;
  const reps = Number.parseInt(trimmed, 10);
  return reps > 0 ? reps : undefined;
}
