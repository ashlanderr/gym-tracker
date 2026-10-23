import { ModalDialog, type ModalProps } from "../../../../components";
import type { DeleteMeasurementData } from "./types.ts";

export function DeleteMeasurementModal({
  data: { text },
  onCancel,
  onSubmit,
}: ModalProps<DeleteMeasurementData, boolean>) {
  return (
    <ModalDialog
      title="Удалить запись?"
      cancelText="НЕТ"
      submitText="УДАЛИТЬ"
      submitColor="#a00"
      onClose={onCancel}
      onSubmit={() => onSubmit(true)}
    >
      {text}
    </ModalDialog>
  );
}
