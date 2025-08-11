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
  queryPreviousRecordByExercise,
  type RecordType,
  useQueryRecordsBySet,
} from "../../../../db/records.ts";
import { generateId } from "../../../../db/db.ts";
import { RECORDS_TRANSLATION } from "../../../constants.ts";
import { PiMedalFill } from "react-icons/pi";
import {
  autoDetectWeights,
  formatRecordValue,
  kgToUnits,
  snapWeightKg,
  unitsToKg,
  volumeToOneRepMax,
} from "../utils.ts";
import { useStore } from "../../../../components";
import { WeightsVisualizer } from "../WeightsVisualizer";
import {
  type PerformanceLoadout,
  updatePerformance,
} from "../../../../db/performances.ts";

export function SetRow({
  exercise,
  performance,
  number,
  set,
  prevSet,
  recSet,
}: SetRowProps) {
  const store = useStore();
  const [isActionsOpen, setActionsOpen] = useState(false);
  const [isRecordsOpen, setRecordsOpen] = useState(false);
  const [weightInput, setWeightInput] = useState<string | null>(null);
  const [repsInput, setRepsInput] = useState<string | null>(null);
  const records = useQueryRecordsBySet(store, set.id);

  const updatedSet = useRef(set);
  useEffect(() => {
    updatedSet.current = set;
  }, [set]);

  const convertWeight = (weightKg: number | undefined): number | undefined => {
    return weightKg !== undefined
      ? Math.round(kgToUnits(weightKg, performance.weights?.units) * 100) / 100
      : undefined;
  };

  const prev = prevSet
    ? `${convertWeight(prevSet.weight)} x ${prevSet.reps}`
    : "-";

  const weight = (convertWeight(set.weight) || "").toString();
  const weightPlaceholder = (convertWeight(recSet?.weight) || "-").toString();
  const expectedWeight = set.weight || recSet?.weight || 0;

  const reps = set.reps ? set.reps.toString() : "";
  const repsPlaceholder = (recSet?.reps || "-").toString();

  const updateSetInner = (updater: (set: Set) => Set): Set => {
    updatedSet.current = updater(updatedSet.current);
    return updatedSet.current;
  };

  const setTypeHandler = (type: SetType) => {
    const set = updateSetInner((set) => ({ ...set, type }));
    updateSet(store, set);
    setActionsOpen(false);
  };

  const removeHandler = async () => {
    records.forEach((r) => deleteRecord(store, r));
    deleteSet(store, set);
    setActionsOpen(false);
  };

  const weightBlurHandler = () => {
    if (weightInput === null) return;
    const newWeight = Number.parseFloat(weightInput || "0");
    setWeightInput(null);

    if (!Number.isNaN(newWeight) && newWeight >= 0) {
      let newWeightKg = unitsToKg(newWeight, performance.weights?.units);

      if (newWeightKg && !performance.weights?.auto) {
        newWeightKg = snapWeightKg(performance.weights, newWeightKg);
      }

      const set = updateSetInner((set) => ({
        ...set,
        weight: newWeightKg,
      }));

      updateSet(store, set);
    }
  };

  const repsBlurHandler = () => {
    if (repsInput === null) return;
    const newReps = Number.parseFloat(repsInput || "0");
    setRepsInput(null);

    if (!Number.isNaN(newReps) && newReps >= 0) {
      const set = updateSetInner((set) => ({ ...set, reps: newReps }));
      updateSet(store, set);
    }
  };

  const addRecords = (set: Set) => {
    // todo support negative weights
    if (exercise?.weight?.type === "negative") return;

    const currentRecords: Array<{ type: RecordType; value: number }> = [
      { type: "one_rep_max", value: volumeToOneRepMax(set.weight, set.reps) },
      { type: "weight", value: set.weight },
      { type: "volume", value: set.weight * set.reps },
    ];

    for (const currentRecord of currentRecords) {
      const previousRecord = queryPreviousRecordByExercise(
        store,
        currentRecord.type,
        set.exercise,
        performance.startedAt,
      );
      const previousValue = previousRecord?.current ?? 0;

      if (currentRecord.value > previousValue) {
        addRecord(store, {
          id: generateId(),
          user: set.user,
          workout: set.workout,
          exercise: set.exercise,
          performance: set.performance,
          set: set.id,
          createdAt: performance.startedAt,
          type: currentRecord.type,
          previous: previousValue,
          current: currentRecord.value,
        });
      }
    }
  };

  const updateWeights = (set: Set) => {
    const weights = autoDetectWeights(
      performance.weights,
      prevSet?.weight,
      set.weight,
    );
    updatePerformance(store, {
      ...performance,
      weights,
    });
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
      if (set.completed) {
        updateSet(store, set);
        addRecords(set);
        updateWeights(set);
      }
    } else {
      const set = updateSetInner((set) => ({ ...set, completed: false }));
      updateSet(store, set);
      records.map((r) => deleteRecord(store, r));
    }
  };

  const setInfoHandler = () => {
    if (!set.completed) {
      setActionsOpen(true);
    } else if (records.length !== 0) {
      setRecordsOpen(true);
    }
  };

  const visualizerChangeHandler = (loadout: PerformanceLoadout) => {
    updatePerformance(store, {
      ...performance,
      loadout,
    });
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
        <div className={s.sheetHeader}>Подход</div>
        <div className={s.sheetWeights}>
          <WeightsVisualizer
            equipment={exercise?.equipment ?? "none"}
            weights={performance.weights}
            loadout={performance.loadout}
            weightKg={expectedWeight}
            onChange={visualizerChangeHandler}
          />
        </div>
        <div className={s.sheetActions}>
          <button
            className={s.sheetAction}
            onClick={() => setTypeHandler("warm-up")}
          >
            <span>W</span>
            <span>Разминочный подход</span>
          </button>
          <button
            className={s.sheetAction}
            onClick={() => setTypeHandler("working")}
          >
            <span>1</span>
            <span>Обычный подход</span>
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
