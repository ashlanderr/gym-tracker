import s from "./styles.module.scss";
import { MdDelete, MdInfoOutline, MdSwapVert } from "react-icons/md";
import { clsx } from "clsx";
import {
  BottomSheet,
  type ModalProps,
  PageModal,
  useStore,
} from "../../../../components";
import type { PerformanceActionsData } from "./types.ts";
import {
  type Performance,
  queryPerformancesByWorkout,
  updatePerformance,
} from "../../../../db";
import { deletePerformance } from "../../../../domain";
import { useNavigate } from "react-router";
import { useState } from "react";
import { PerformanceOrder } from "../PerformanceOrder";

export function PerformanceActions({
  data,
  onCancel,
}: ModalProps<PerformanceActionsData, null>) {
  const { performance, exercise } = data;
  const store = useStore();
  const navigate = useNavigate();
  const [orderState, setOrderState] = useState<Performance[]>([]);

  const exerciseHandler = async () => {
    await onCancel();
    navigate(`/exercises/${exercise.id}?performance=${performance.id}`);
  };

  const orderBeginHandler = () => {
    setOrderState(queryPerformancesByWorkout(store, performance.workout));
  };

  const orderCompleteHandler = (items: Performance[]) => {
    items.forEach((p) => updatePerformance(store, p));
    setOrderState([]);
    onCancel();
  };

  const deleteHandler = () => {
    deletePerformance(store, performance);
    onCancel();
  };

  return (
    <>
      <BottomSheet onClose={onCancel}>
        <div className={s.sheetHeader}>Упражнение</div>
        <div className={s.sheetActions}>
          <button className={s.sheetAction} onClick={exerciseHandler}>
            <MdInfoOutline />
            <span>Страница упражнения</span>
          </button>
          <button className={s.sheetAction} onClick={orderBeginHandler}>
            <MdSwapVert />
            <span>Порядок выполнения</span>
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
    </>
  );
}
