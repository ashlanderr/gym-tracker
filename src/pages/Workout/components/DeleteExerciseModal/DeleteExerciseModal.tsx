import { ModalDialog, type ModalProps } from "../../../../components";

export function DeleteExerciseModal({
  onCancel,
  onSubmit,
}: ModalProps<null, boolean>) {
  return (
    <ModalDialog
      title={"Подтверждение"}
      cancelText="Отмена"
      submitText="Удалить"
      submitColor="#a00"
      onClose={onCancel}
      onSubmit={() => onSubmit(true)}
    >
      Вы уверены, что хотите удалить упражнение?
    </ModalDialog>
  );
}
