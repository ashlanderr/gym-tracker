import s from "./styles.module.scss";
import { MdAutorenew, MdBarChart, MdDelete, MdEdit } from "react-icons/md";
import { clsx } from "clsx";
import {
  BottomSheet,
  type ModalProps,
  PageModal,
  useModalStack,
  useStore,
} from "../../../../components";
import type { PerformanceActionsData } from "./types.ts";
import { type Exercise, updatePerformance } from "../../../../db";
import { deletePerformance, replacePerformance } from "../../../../domain";
import { useNavigate } from "react-router";
import { useState } from "react";
import { ChooseExercise } from "../ChooseExercise";
import { AddExercise } from "../AddExercise";
import { LuTrendingUp } from "react-icons/lu";
import { PeriodizationSelector } from "../PeriodizationSelector";

export function PerformanceActions({
  data,
  onCancel,
}: ModalProps<PerformanceActionsData, null>) {
  const { performance, exercise } = data;
  const store = useStore();
  const navigate = useNavigate();
  const { pushModal } = useModalStack();
  const [isReplaceOpen, setReplaceOpen] = useState(false);

  const historyHandler = async () => {
    if (exercise) {
      await onCancel();
      navigate(
        `/exercises/${exercise.id}/history?program=${performance.program || ""}`,
      );
    }
  };

  const replaceBeginHandler = () => {
    setReplaceOpen(true);
  };

  const editHandler = async () => {
    if (!exercise) return;
    await onCancel();
    await pushModal(AddExercise, exercise);
  };

  const replaceCompleteHandler = (exercise: Exercise) => {
    replacePerformance(store, performance, exercise.id);
    onCancel();
  };

  const deleteHandler = () => {
    deletePerformance(store, performance);
    onCancel();
  };

  const periodizationHandler = async () => {
    await onCancel();
    const periodization = await pushModal(PeriodizationSelector, null);
    if (periodization) {
      updatePerformance(store, {
        ...performance,
        periodization: periodization !== "none" ? periodization : undefined,
      });
    }
  };

  return (
    <>
      <BottomSheet onClose={onCancel}>
        <div className={s.sheetHeader}>{exercise?.name ?? "Упражнение"}</div>
        <div className={s.sheetActions}>
          <button className={s.sheetAction} onClick={historyHandler}>
            <MdBarChart />
            <span>История выполнения</span>
          </button>
          <button className={s.sheetAction} onClick={replaceBeginHandler}>
            <MdAutorenew />
            <span>Заменить на другое</span>
          </button>
          <button className={s.sheetAction} onClick={periodizationHandler}>
            <LuTrendingUp />
            <span>Выбор периодизации</span>
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

      <PageModal isOpen={isReplaceOpen}>
        <ChooseExercise
          onCancel={() => onCancel()}
          onSubmit={replaceCompleteHandler}
        />
      </PageModal>
    </>
  );
}
