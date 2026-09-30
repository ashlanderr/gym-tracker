import { ConfirmDialog, type ModalProps } from "../../../../components";

// Signing out wipes the device, and whatever has not reached the account yet
// goes with it. That is allowed, since somebody may need out of a phone with
// no network, but only after the same pause as deleting data.
export function SignOutModal({
  data: saved,
  onCancel,
  onSubmit,
}: ModalProps<boolean, boolean>) {
  return (
    <ConfirmDialog
      title="Выйти из аккаунта?"
      submitLabel="Выйти"
      waitSeconds={saved ? 0 : 5}
      warning={saved ? null : "Если выйти сейчас, они пропадут"}
      onClose={onCancel}
      onSubmit={() => onSubmit(true)}
    >
      {saved
        ? "С телефона данные удалятся, но останутся в аккаунте. Чтобы вернуть их, войди снова."
        : "Не все изменения сохранены в аккаунте. Подключись к интернету, чтобы сохранить их."}
    </ConfirmDialog>
  );
}
