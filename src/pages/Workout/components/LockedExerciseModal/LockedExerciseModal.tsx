import s from "./styles.module.scss";
import { ModalDialog, type ModalProps } from "../../../../components";
import type { LockedExerciseData } from "./types.ts";

// Doing exercises out of order is not forbidden, only warned about: the
// machine for the current one may be taken.
export function LockedExerciseModal({
  data,
  onCancel,
  onSubmit,
}: ModalProps<LockedExerciseData, true>) {
  return (
    <ModalDialog
      title={`Сначала ${data.current.join(" и ")}`}
      width="320px"
      cancelText="Назад"
      submitText="Всё равно начать"
      onClose={onCancel}
      onSubmit={() => onSubmit(true)}
    >
      <div className={s.text}>
        Начатое упражнение ещё не закончено. Если переключиться, мышцы придут
        уставшими, и веса с повторами разойдутся с прошлым разом.
      </div>
    </ModalDialog>
  );
}
