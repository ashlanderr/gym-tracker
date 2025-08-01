import type { SetRowProps } from "./types.ts";
import s from "./styles.module.scss";
import { MdCheck, MdDelete } from "react-icons/md";
import { BottomSheet } from "../BottomSheet";
import { useEffect, useRef, useState } from "react";
import {
  deleteSet,
  type SetType,
  updateSet,
  type Set,
} from "../../../../db/sets.ts";
import { clsx } from "clsx";

export function SetRow({ number, set, prevSet, recSet }: SetRowProps) {
  const [isSheetOpen, setSheetOpen] = useState(false);
  const [weightInput, setWeightInput] = useState<string | null>(null);
  const [repsInput, setRepsInput] = useState<string | null>(null);

  const updatedSet = useRef(set);
  useEffect(() => {
    updatedSet.current = set;
  }, [set]);

  const prev = prevSet ? `${prevSet.weight}кг x ${prevSet.reps}` : "-";

  const weight = set.weight ? set.weight.toString() : "";
  const weightPlaceholder = (recSet?.weight || "-").toString();

  const reps = set.reps ? set.reps.toString() : "";
  const repsPlaceholder = (recSet?.reps || "-").toString();

  const updateSetInner = async (updater: (set: Set) => Set) => {
    updatedSet.current = updater(updatedSet.current);
    await updateSet(updatedSet.current);
  };

  const setTypeHandler = async (type: SetType) => {
    await updateSetInner((set) => ({ ...set, type }));
    setSheetOpen(false);
  };

  const removeHandler = async () => {
    await deleteSet(set);
    setSheetOpen(false);
  };

  const weightBlurHandler = async () => {
    if (weightInput === null) return;
    const newWeight = Number.parseFloat(weightInput || "0");

    if (!Number.isNaN(newWeight) && newWeight >= 0) {
      await updateSetInner((set) => ({ ...set, weight: newWeight }));
    }

    setWeightInput(null);
  };

  const repsBlurHandler = async () => {
    if (repsInput === null) return;
    const newReps = Number.parseFloat(repsInput || "0");

    if (!Number.isNaN(newReps) && newReps >= 0) {
      await updateSetInner((set) => ({ ...set, reps: newReps }));
    }

    setRepsInput(null);
  };

  const completeHandler = async () => {
    if (!set.completed) {
      await updateSetInner((set) => {
        const weight = set.weight || recSet?.weight;
        const reps = set.reps || recSet?.reps;
        if (weight && reps) {
          return { ...set, weight, reps, completed: true };
        } else {
          return set;
        }
      });
    } else {
      await updateSetInner((set) => ({ ...set, completed: false }));
    }
  };

  return (
    <>
      <tr className={clsx(set.completed && s.completed)}>
        <td className={s.setNumValue} onClick={() => setSheetOpen(true)}>
          {number}
        </td>
        <td className={s.prevVolumeValue}>{prev}</td>
        <td className={s.currentWeightValue}>
          <input
            className={s.input}
            value={weightInput ?? weight}
            placeholder={weightPlaceholder}
            disabled={set.completed}
            type="text"
            inputMode="numeric"
            onContextMenu={(e) => e.preventDefault()}
            onChange={(e) => setWeightInput(e.target.value)}
            onFocus={(e) => e.target.select()}
            onBlur={weightBlurHandler}
          />
        </td>
        <td className={s.currentRepsValue}>
          <input
            className={s.input}
            value={repsInput ?? reps}
            placeholder={repsPlaceholder}
            disabled={set.completed}
            type="text"
            inputMode="numeric"
            onContextMenu={(e) => e.preventDefault()}
            onChange={(e) => setRepsInput(e.target.value)}
            onFocus={(e) => e.target.select()}
            onBlur={repsBlurHandler}
          />
        </td>
        <td className={s.setCompletedValue}>
          <button className={s.setCompletedButton} onClick={completeHandler}>
            <MdCheck />
          </button>
        </td>
      </tr>
      <BottomSheet isOpen={isSheetOpen} onClose={() => setSheetOpen(false)}>
        <div className={s.sheetHeader}>Выберите тип сета</div>
        <div className={s.sheetActions}>
          <button
            className={s.sheetAction}
            onClick={() => setTypeHandler("warm-up")}
          >
            <span>W</span>
            <span>Разминочный сет</span>
          </button>
          <button
            className={s.sheetAction}
            onClick={() => setTypeHandler("working")}
          >
            <span>1</span>
            <span>Обычный сет</span>
          </button>
          <button className={s.sheetAction} onClick={removeHandler}>
            <MdDelete />
            <span>Удалить сет</span>
          </button>
        </div>
      </BottomSheet>
    </>
  );
}
