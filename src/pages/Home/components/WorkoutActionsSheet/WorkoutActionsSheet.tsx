import s from "./styles.module.scss";
import { MdDelete, MdEdit, MdEvent, MdPlayArrow } from "react-icons/md";
import { BottomSheet, type ModalProps } from "../../../../components";
import type { WorkoutAction, WorkoutActionsData } from "./types.ts";

export function WorkoutActionsSheet({
  data,
  onCancel,
  onSubmit,
}: ModalProps<WorkoutActionsData, WorkoutAction>) {
  return (
    <BottomSheet onClose={onCancel}>
      <div className={s.sheetHeader}>{data.workout.name}</div>
      <div className={s.sheetActions}>
        <button className={s.sheetAction} onClick={() => onSubmit("open")}>
          <MdEdit />
          <span>Открыть</span>
        </button>
        <button
          className={s.sheetAction}
          disabled={!data.canDuplicate}
          onClick={() => onSubmit("duplicate")}
        >
          <MdPlayArrow />
          <span>Повторить</span>
        </button>
        <button className={s.sheetAction} onClick={() => onSubmit("schedule")}>
          <MdEvent />
          <span>Расписание</span>
        </button>
        <button className={s.sheetAction} onClick={() => onSubmit("delete")}>
          <MdDelete />
          <span>Удалить</span>
        </button>
      </div>
    </BottomSheet>
  );
}
