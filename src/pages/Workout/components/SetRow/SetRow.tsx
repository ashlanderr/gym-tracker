import type { SetRowProps } from "./types.ts";
import s from "./styles.module.scss";
import { MdArrowUpward, MdCheck, MdDelete } from "react-icons/md";
import { BottomSheet } from "../BottomSheet";
import { useEffect, useRef, useState } from "react";
import {
  deleteSet,
  type SetType,
  updateSet,
  type Set,
} from "../../../../db/sets.ts";
import { clsx } from "clsx";
import {
  addRecord,
  deleteRecord,
  queryLatestRecordByExercise,
  type RecordType,
  useQueryRecordsBySet,
} from "../../../../db/records.ts";
import { generateId } from "../../../../db/db.ts";
import { RECORDS_TRANSLATION } from "./constants.ts";
import { PiMedalFill } from "react-icons/pi";
import { volumeToOneRepMax } from "../utils.ts";

export function SetRow({ number, set, prevSet, recSet }: SetRowProps) {
  const [isActionsOpen, setActionsOpen] = useState(false);
  const [isRecordsOpen, setRecordsOpen] = useState(false);
  const [weightInput, setWeightInput] = useState<string | null>(null);
  const [repsInput, setRepsInput] = useState<string | null>(null);
  const records = useQueryRecordsBySet(set.id);

  const updatedSet = useRef(set);
  useEffect(() => {
    updatedSet.current = set;
  }, [set]);

  const prev = prevSet ? `${prevSet.weight}кг x ${prevSet.reps}` : "-";

  const weight = set.weight ? set.weight.toString() : "";
  const weightPlaceholder = (recSet?.weight || "-").toString();

  const reps = set.reps ? set.reps.toString() : "";
  const repsPlaceholder = (recSet?.reps || "-").toString();

  const updateSetInner = (updater: (set: Set) => Set): Set => {
    updatedSet.current = updater(updatedSet.current);
    return updatedSet.current;
  };

  const setTypeHandler = (type: SetType) => {
    const set = updateSetInner((set) => ({ ...set, type }));
    updateSet(set);
    setActionsOpen(false);
  };

  const removeHandler = async () => {
    records.forEach((r) => deleteRecord(r));
    deleteSet(set);
    setActionsOpen(false);
  };

  const weightBlurHandler = () => {
    if (weightInput === null) return;
    const newWeight = Number.parseFloat(weightInput || "0");
    setWeightInput(null);

    if (!Number.isNaN(newWeight) && newWeight >= 0) {
      const set = updateSetInner((set) => ({ ...set, weight: newWeight }));
      updateSet(set);
    }
  };

  const repsBlurHandler = () => {
    if (repsInput === null) return;
    const newReps = Number.parseFloat(repsInput || "0");
    setRepsInput(null);

    if (!Number.isNaN(newReps) && newReps >= 0) {
      const set = updateSetInner((set) => ({ ...set, reps: newReps }));
      updateSet(set);
    }
  };

  const updateRecords = (set: Set) => {
    const currentRecords: Array<{ type: RecordType; value: number }> = [
      { type: "one_rep_max", value: volumeToOneRepMax(set.weight, set.reps) },
      { type: "weight", value: set.weight },
      { type: "volume", value: set.weight * set.reps },
    ];

    for (const currentRecord of currentRecords) {
      const previousRecord = queryLatestRecordByExercise(
        currentRecord.type,
        set.exercise,
      );
      const previousValue = previousRecord?.current ?? 0;

      if (currentRecord.value > previousValue) {
        addRecord({
          id: generateId(),
          user: set.user,
          workout: set.workout,
          exercise: set.exercise,
          performance: set.performance,
          set: set.id,
          createdAt: Date.now(),
          type: currentRecord.type,
          previous: previousValue,
          current: currentRecord.value,
        });
      }
    }
  };

  const completeHandler = async () => {
    if (!set.completed) {
      const set = updateSetInner((set) => {
        const weight = set.weight || recSet?.weight;
        const reps = set.reps || recSet?.reps;
        if (weight && reps) {
          return { ...set, weight, reps, completed: true };
        } else {
          return set;
        }
      });
      updateSet(set);
      updateRecords(set);
    } else {
      const set = updateSetInner((set) => ({ ...set, completed: false }));
      updateSet(set);
      records.map((r) => deleteRecord(r));
    }
  };

  const setInfoHandler = () => {
    if (!set.completed) {
      setActionsOpen(true);
    } else if (records.length !== 0) {
      setRecordsOpen(true);
    }
  };

  return (
    <>
      <tr className={clsx(set.completed && s.completed)}>
        <td className={s.setNumValue} onClick={setInfoHandler}>
          {records.length === 0 ? (
            <span>{number}</span>
          ) : (
            <PiMedalFill className={s.recordMedal} />
          )}
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
      <BottomSheet isOpen={isActionsOpen} onClose={() => setActionsOpen(false)}>
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
      <BottomSheet isOpen={isRecordsOpen} onClose={() => setRecordsOpen(false)}>
        <div className={s.sheetHeader}>Новый рекорд</div>
        <div className={s.sheetRecords}>
          {records.map((r) => (
            <div className={s.sheetRecord} key={r.type}>
              <div className={s.recordType}>{RECORDS_TRANSLATION[r.type]}</div>
              <div className={s.recordValue}>
                {formatRecordValue(r.current)} кг
              </div>
              {r.previous !== 0 && (
                <div className={s.recordIncrement}>
                  <MdArrowUpward /> {formatRecordValue(r.current - r.previous)}{" "}
                  кг
                </div>
              )}
            </div>
          ))}
        </div>
      </BottomSheet>
    </>
  );
}

function formatRecordValue(value: number) {
  return (Math.round(value * 100) / 100).toLocaleString();
}
