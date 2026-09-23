import { ConfirmDialog, type ModalProps } from "../../../../components";
import type { DeleteMeasurementData } from "./types.ts";

export function DeleteMeasurementModal({
  data: { text },
  onCancel,
  onSubmit,
}: ModalProps<DeleteMeasurementData, boolean>) {
  return (
    <ConfirmDialog
      title="Удалить запись?"
      submitLabel="Удалить"
      onClose={onCancel}
      onSubmit={() => onSubmit(true)}
    >
      {text}
    </ConfirmDialog>
  );
}
