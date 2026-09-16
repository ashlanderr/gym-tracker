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
  useModalStack,
  useStore,
} from "../../../../components";
import type { PerformanceActionsData } from "./types.ts";
import {
  type Exercise,
  type Gym,
  type Performance,
  queryPerformancesByWorkout,
  updateGym,
  updatePerformance,
  useQueryCurrentGym,
} from "../../../../db";
import { deletePerformance, replacePerformance } from "../../../../domain";
import { useNavigate } from "react-router";
import { useState } from "react";
import { PerformanceOrder } from "../PerformanceOrder";
import { ChooseExercise } from "../ChooseExercise";
import { AddExercise } from "../AddExercise";
import { WeightsSelector } from "../WeightsSelector";
import { LuRepeat } from "react-icons/lu";
import { CustomRepsModal } from "../CustomRepsModal";
import { formatRepRange } from "../SetRow/utils.ts";

export function PerformanceActions({
  data,
  onCancel,
}: ModalProps<PerformanceActionsData, null>) {
  const { performance, exercise } = data;
  const store = useStore();
  const navigate = useNavigate();
  const { pushModal } = useModalStack();
  const [orderState, setOrderState] = useState<Performance[]>([]);
  const [isReplaceOpen, setReplaceOpen] = useState(false);
  const [isWeightsOpen, setWeightsOpen] = useState(false);
  const gym = useQueryCurrentGym(store, performance.user);

  const historyHandler = async () => {
    await onCancel();
    navigate(`/exercises/${exercise.id}/history`);
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

  const editHandler = async () => {
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

  const weightsBeginHandler = () => {
    setWeightsOpen(true);
  };

  const weightsCompleteHandler = (gym: Gym) => {
    updateGym(store, gym);
    onCancel();
  };

  const repsHandler = async () => {
    await onCancel();
    const reps = await pushModal(CustomRepsModal, performance.reps);
    if (reps) updatePerformance(store, { ...performance, reps });
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
          {exercise.load.type !== "none" && (
            <button className={s.sheetAction} onClick={weightsBeginHandler}>
              <TbWeight />
              <span>Мой инвентарь</span>
            </button>
          )}
          <button className={s.sheetAction} onClick={repsHandler}>
            <LuRepeat />
            <span>Повторы: {formatRepRange(performance.reps)}</span>
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

      <PageModal isOpen={isWeightsOpen}>
        <WeightsSelector
          exercise={exercise}
          gym={gym}
          onCancel={() => onCancel()}
          onSubmit={weightsCompleteHandler}
        />
      </PageModal>
    </>
  );
}
