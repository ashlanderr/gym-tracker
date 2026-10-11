import s from "./styles.module.scss";
import { clsx } from "clsx";
import { MdDelete, MdEdit } from "react-icons/md";
import { BottomSheet, type ModalProps } from "../../../../components";
import type { Exercise } from "../../../../db";
import type { ExerciseAction } from "./types.ts";

export function ExerciseActionsSheet({
  data,
  onCancel,
  onSubmit,
}: ModalProps<Exercise, ExerciseAction>) {
  return (
    <BottomSheet onClose={onCancel}>
      <div className={s.sheetHeader}>{data.name}</div>
      <div className={s.sheetActions}>
        <button className={s.sheetAction} onClick={() => onSubmit("edit")}>
          <MdEdit />
          <span>Редактировать упражнение</span>
        </button>
        <button
          className={clsx(s.sheetAction, s.danger)}
          onClick={() => onSubmit("delete")}
        >
          <MdDelete />
          <span>Удалить упражнение</span>
        </button>
      </div>
    </BottomSheet>
  );
}
