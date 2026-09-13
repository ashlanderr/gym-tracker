import type { AddProgramResult } from "./types.ts";
import { ModalDialog, type ModalProps } from "../../../../components";
import { useState } from "react";
import s from "./styles.module.scss";

export function AddProgramModal({
  onCancel,
  onSubmit,
}: ModalProps<null, AddProgramResult>) {
  const [name, setName] = useState("");

  const trimmedName = name.trim();
  const disabled = !trimmedName;

  return (
    <ModalDialog
      title="Новая программа"
      width="300px"
      cancelText="Отмена"
      submitText="Создать"
      submitDisabled={disabled}
      onClose={onCancel}
      onSubmit={() => onSubmit({ name })}
    >
      <label className={s.label}>Название программы</label>
      <input
        className={s.input}
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
    </ModalDialog>
  );
}
