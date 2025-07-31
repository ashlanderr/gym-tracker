import type { CompleteWorkoutModalProps } from "./types.ts";
import { ModalDialog } from "../ModalDialog";
import { useEffect, useState } from "react";
import s from "./styles.module.scss";

export function CompleteWorkoutModal({
  workout,
  isOpen,
  onClose,
  onSubmit,
}: CompleteWorkoutModalProps) {
  const [name, setName] = useState("");

  useEffect(() => {
    setName(workout.name);
  }, [workout, isOpen]);

  const trimmedName = name.trim();
  const disabled = !trimmedName;

  return (
    <ModalDialog
      title="Завершение"
      width="300px"
      cancelText="Отмена"
      submitText="Завершить"
      submitDisabled={disabled}
      isOpen={isOpen}
      onClose={onClose}
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
