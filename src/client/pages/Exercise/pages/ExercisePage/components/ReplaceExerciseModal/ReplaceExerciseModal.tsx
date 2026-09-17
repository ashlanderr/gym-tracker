import s from "./styles.module.scss";
import { ModalDialog, type ModalProps } from "../../../../../../components";
import { isSingular, pluralize } from "../../../../../../utils";
import type { ReplaceExerciseData } from "./types.ts";

export function ReplaceExerciseModal({
  data,
  onCancel,
  onSubmit,
}: ModalProps<ReplaceExerciseData, boolean>) {
  const { from, to, doneSets } = data;

  return (
    <ModalDialog
      title="Заменить упражнение?"
      width="320px"
      cancelText="Отмена"
      submitText="Заменить"
      onClose={onCancel}
      onSubmit={() => onSubmit(true)}
    >
      <p className={s.text}>
        Вместо «{from}» в этой тренировке будет «{to}».
      </p>
      {doneSets !== 0 && (
        <p className={s.text}>
          {doneSets === 1
            ? "Сделанный подход не сохранится."
            : `${isSingular(doneSets) ? "Сделанный" : "Сделанные"} ${pluralize(doneSets, ["подход", "подхода", "подходов"])} не ${isSingular(doneSets) ? "сохранится" : "сохранятся"}.`}
        </p>
      )}
    </ModalDialog>
  );
}
