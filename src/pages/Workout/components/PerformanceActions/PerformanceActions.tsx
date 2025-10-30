import s from "./styles.module.scss";
import {
  MdAutorenew,
  MdBarChart,
  MdDelete,
  MdEdit,
  MdSwapVert,
} from "react-icons/md";
import { TbWeight } from "react-icons/tb";
import { clsx } from "clsx";
import {
  BottomSheet,
  type ModalProps,
  PageModal,
  useStore,
} from "../../../../components";
import type { PerformanceActionsData } from "./types.ts";
import {
  type Exercise,
  type Performance,
  type PerformanceWeights,
  queryPerformancesByWorkout,
  updatePerformance,
} from "../../../../db";
import { deletePerformance, replacePerformance } from "../../../../domain";
import { useNavigate } from "react-router";
import { useState } from "react";
import { PerformanceOrder } from "../PerformanceOrder";
import { ChooseExercise } from "../ChooseExercise";
import { AddExercise } from "../AddExercise";
import { WeightsSelector } from "../WeightsSelector";

export function PerformanceActions({
  data,
  onCancel,
}: ModalProps<PerformanceActionsData, null>) {
  const { performance, exercise } = data;
  const store = useStore();
  const navigate = useNavigate();
  const [orderState, setOrderState] = useState<Performance[]>([]);
  const [isReplaceOpen, setReplaceOpen] = useState(false);
  const [isWeightsOpen, setWeightsOpen] = useState(false);
  const [editState, setEditState] = useState<Exercise | null>(null);

  const historyHandler = async () => {
    if (exercise) {
      await onCancel();
      navigate(`/exercises/${exercise.id}/history`);
    }
  };

  const orderBeginHandler = () => {
    setOrderState(queryPerformancesByWorkout(store, performance.workout));
  };

  const orderCompleteHandler = (items: Performance[]) => {
    items.forEach((p) => updatePerformance(store, p));
    setOrderState([]);
    onCancel();
  };

  const replaceBeginHandler = () => {
    setReplaceOpen(true);
  };

  const editBeginHandler = () => {
    if (!exercise) return;
    setEditState(exercise);
  };

  const replaceCompleteHandler = (exercise: Exercise) => {
    replacePerformance(store, performance, exercise.id);
    onCancel();
  };

  const deleteHandler = () => {
    deletePerformance(store, performance);
    onCancel();
  };

  const weightsBeginHandler = () => {
    setWeightsOpen(true);
  };

  const weightsCompleteHandler = (weights: PerformanceWeights | undefined) => {
    updatePerformance(store, { ...performance, weights });
    onCancel();
  };

  return (
    <>
      <BottomSheet onClose={onCancel}>
        <div className={s.sheetHeader}>Упражнение</div>
        <div className={s.sheetActions}>
          <button className={s.sheetAction} onClick={historyHandler}>
            <MdBarChart />
            <span>История выполнения</span>
          </button>
          <button className={s.sheetAction} onClick={orderBeginHandler}>
            <MdSwapVert />
            <span>Порядок выполнения</span>
          </button>
          <button className={s.sheetAction} onClick={replaceBeginHandler}>
            <MdAutorenew />
            <span>Заменить на другое</span>
          </button>
          {exercise?.equipment && (
            <button className={s.sheetAction} onClick={weightsBeginHandler}>
              <TbWeight />
              <span>Настройка весов</span>
            </button>
          )}
          <button className={s.sheetAction} onClick={editBeginHandler}>
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

      <PageModal isOpen={orderState.length !== 0}>
        <PerformanceOrder
          performances={orderState}
          onCancel={() => onCancel()}
          onSubmit={orderCompleteHandler}
        />
      </PageModal>

      <PageModal isOpen={isReplaceOpen}>
        <ChooseExercise
          onCancel={() => onCancel()}
          onSubmit={replaceCompleteHandler}
        />
      </PageModal>

      {editState && (
        <PageModal isOpen={true}>
          <AddExercise
            exercise={editState}
            onCancel={() => onCancel()}
            onSubmit={() => onCancel()}
          />
        </PageModal>
      )}

      <PageModal isOpen={isWeightsOpen}>
        <WeightsSelector
          equipment={exercise?.equipment ?? "none"}
          weights={performance.weights}
          onCancel={() => onCancel()}
          onSubmit={weightsCompleteHandler}
        />
      </PageModal>
    </>
  );
}
