import { ModalDialog, type ModalProps } from "../../../../components";

export const CancelWorkoutModal = ({
  onCancel,
  onSubmit,
}: ModalProps<null, boolean>) => {
  return (
    <ModalDialog
      title={"Подтверждение"}
      cancelText="НЕТ"
      submitText="ДА"
      submitColor="#a00"
      onClose={onCancel}
      onSubmit={() => onSubmit(true)}
    >
      Вы уверены, что хотите отменить тренировку?
    </ModalDialog>
  );
};
