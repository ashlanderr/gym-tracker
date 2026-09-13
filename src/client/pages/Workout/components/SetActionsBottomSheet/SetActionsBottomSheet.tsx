import s from "./styles.module.scss";
import { WeightsVisualizer } from "../WeightsVisualizer";
import { clsx } from "clsx";
import { MdDelete } from "react-icons/md";
import { BottomSheet, type ModalProps, useStore } from "../../../../components";
import { deleteSet, type SetType, updateSet } from "../../../../db";
import { updateRecords } from "../../../../domain";
import type { SetActionBottomSheetData } from "./types.ts";

export function SetActionsBottomSheet({
  data,
  onCancel,
}: ModalProps<SetActionBottomSheetData, null>) {
  const store = useStore();
  const { exercise, performance, set, recSet } = data;
  const expectedWeight = set.weight ?? recSet?.weight;

  const setTypeHandler = (type: SetType) => {
    updateSet(store, { ...set, type });
    onCancel();
  };

  const removeHandler = async () => {
    deleteSet(store, set);
    updateRecords(store, set);
    onCancel();
  };

  return (
    <BottomSheet isOpen={true} onClose={onCancel}>
      <div className={s.sheetHeader}>Подход</div>
      <div className={s.sheetWeights}>
        {expectedWeight !== undefined && (
          <WeightsVisualizer
            equipment={exercise?.equipment ?? "none"}
            weights={performance.weights}
            weightKg={expectedWeight}
          />
        )}
      </div>
      <div className={s.sheetActions}>
        <button
          className={s.sheetAction}
          onClick={() => setTypeHandler("warm-up")}
        >
          <span className={s.warmUpSet}>W</span>
          <span>Разминочный подход</span>
        </button>
        <button
          className={s.sheetAction}
          onClick={() => setTypeHandler("working")}
        >
          <span className={s.workingSet}>1</span>
          <span>Обычный подход</span>
        </button>
        <button
          className={s.sheetAction}
          onClick={() => setTypeHandler("light")}
        >
          <span className={s.lightSet}>L</span>
          <span>Легкий подход</span>
        </button>
        <button
          className={s.sheetAction}
          onClick={() => setTypeHandler("failure")}
        >
          <span className={s.failureSet}>F</span>
          <span>Подход в отказ</span>
        </button>
        <button
          className={clsx(s.sheetAction, s.danger)}
          onClick={removeHandler}
        >
          <MdDelete />
          <span>Удалить подход</span>
        </button>
      </div>
    </BottomSheet>
  );
}
