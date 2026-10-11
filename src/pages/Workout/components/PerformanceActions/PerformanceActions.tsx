import s from "./styles.module.scss";
import { MdAutorenew, MdBarChart, MdDelete, MdEdit } from "react-icons/md";
import { clsx } from "clsx";
import {
  BottomSheet,
  type ModalProps,
  useModalStack,
  useStore,
} from "../../../../components";
import type { PerformanceActionsData } from "./types.ts";
import { deletePerformance, replacePerformance } from "../../../../domain";
import { useNavigate } from "react-router";
import { ChooseExerciseModal } from "../ChooseExerciseModal";
import { AddExercise } from "../AddExercise";

export function PerformanceActions({
  data,
  onCancel,
}: ModalProps<PerformanceActionsData, null>) {
  const { performance, exercise } = data;
  const store = useStore();
  const navigate = useNavigate();
  const { pushModal } = useModalStack();

  const historyHandler = async () => {
    if (exercise) {
      await onCancel();
      navigate(
        `/exercises/${exercise.id}/history?program=${performance.program || ""}`,
      );
    }
  };

  const replaceHandler = async () => {
    await onCancel();
    const newExercise = await pushModal(ChooseExerciseModal, null);
    if (newExercise) replacePerformance(store, performance, newExercise.id);
  };

  const editHandler = async () => {
    if (!exercise) return;
    await onCancel();
    await pushModal(AddExercise, exercise);
  };

  const deleteHandler = () => {
    deletePerformance(store, performance);
    onCancel();
  };

  return (
    <BottomSheet onClose={onCancel}>
      <div className={s.sheetHeader}>{exercise?.name ?? "Упражнение"}</div>
      <div className={s.sheetActions}>
        <button className={s.sheetAction} onClick={historyHandler}>
          <MdBarChart />
          <span>История выполнения</span>
        </button>
        <button className={s.sheetAction} onClick={replaceHandler}>
          <MdAutorenew />
          <span>Заменить на другое</span>
        </button>
        <button className={s.sheetAction} onClick={editHandler}>
          <MdEdit />
          <span>Изменить упражнение</span>
        </button>
        <button
          className={clsx(s.sheetAction, s.danger)}
          onClick={deleteHandler}
        >
          <MdDelete />
          <span>Удалить из тренировки</span>
        </button>
      </div>
    </BottomSheet>
  );
}
