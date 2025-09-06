import type { CompleteWorkoutData, CompleteWorkoutResult } from "./types.ts";
import { ModalDialog, type ModalProps } from "../../../../components";
import { useState } from "react";
import s from "./styles.module.scss";

export function CompleteWorkoutModal({
  data,
  onCancel,
  onSubmit,
}: ModalProps<CompleteWorkoutData, CompleteWorkoutResult>) {
  const [confirmed, setConfirmed] = useState(data.partial);
  const [name, setName] = useState(data.workout.name);

  const trimmedName = name.trim();
  const disabled = !trimmedName;

  return !confirmed ? (
    <ModalDialog
      title="Подтверждение"
      width="300px"
      cancelText="Отмена"
      submitText="Завершить"
      onClose={onCancel}
      onSubmit={() => setConfirmed(true)}
    >
      Не все сеты выполнены. Вы точно ходите завершить тренировку?
    </ModalDialog>
  ) : (
    <ModalDialog
      title="Завершение"
      width="300px"
      cancelText="Отмена"
      submitText="Завершить"
      submitDisabled={disabled}
      onClose={onCancel}
      onSubmit={() => onSubmit({ name })}
    >
      <label className={s.label}>Название тренировки</label>
      <input
        className={s.input}
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
    </ModalDialog>
  );
}
