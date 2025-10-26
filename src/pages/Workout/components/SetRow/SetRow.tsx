import type { NewRecordData, SetRowProps } from "./types.ts";
import s from "./styles.module.scss";
import { MdArrowUpward, MdCheck, MdDelete } from "react-icons/md";
import { BottomSheet, useStore } from "../../../../components";
import { useEffect, useRef, useState } from "react";
import {
  deleteSet,
  type SetType,
  updateSet,
  type Set,
  type CompletedSet,
  addRecord,
  deleteRecord,
  queryPreviousRecordByExercise,
  useQueryRecordsBySet,
  generateId,
  queryLatestMeasurement,
  compareRecords,
} from "../../../../db";
import { clsx } from "clsx";
import { RECORDS_TRANSLATION } from "../../../constants.ts";
import { PiMedalFill } from "react-icons/pi";
import {
  addSelfWeight,
  formatRecordValue,
  kgToUnits,
  snapWeightKg,
  unitsToKg,
  volumeToOneRepMax,
} from "../../../../domain";
import { WeightsVisualizer } from "../WeightsVisualizer";
import { useActiveTimer, useTimerAudio } from "../ActiveTimer";
import { formatRepRange } from "./utils.ts";

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
  const timerAudio = useTimerAudio(performance.timer);
  const { startTimer } = useActiveTimer();

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

  const weight = (convertWeight(set.weight) ?? "").toString();
  const weightPlaceholder = (convertWeight(recSet?.weight) ?? "-").toString();
  const expectedWeight = set.weight ?? recSet?.weight;

  const reps = set.reps?.toString() ?? "";
  const repsPlaceholder = recSet?.reps ? formatRepRange(recSet.reps) : "-";

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
    const newWeight = Number.parseFloat(weightInput);
    setWeightInput(null);

    let newWeightKg = !Number.isNaN(newWeight)
      ? unitsToKg(newWeight, performance.weights?.units)
      : undefined;

    if (newWeightKg !== undefined) {
      newWeightKg = snapWeightKg(performance.weights, newWeightKg);
    }

    const set = updateSetInner((set) =>
      !set.completed ? { ...set, weight: newWeightKg } : set,
    );
    updateSet(store, set);
  };

  const repsBlurHandler = () => {
    if (repsInput === null) return;
    const newReps = Number.parseFloat(repsInput);
    setRepsInput(null);

    const newRepsValue = !Number.isNaN(newReps) ? newReps : undefined;

    const set = updateSetInner((set) =>
      !set.completed ? { ...set, reps: newRepsValue } : set,
    );
    updateSet(store, set);
  };

  const addRecords = (set: CompletedSet) => {
    if (!exercise) return;

    const measurement = queryLatestMeasurement(store, performance.startedAt);
    const selfWeight = measurement?.weight;
    const fullWeight = addSelfWeight(exercise.weight, selfWeight, set.weight);

    const currentRecords: Array<NewRecordData> = [
      {
        type: "one_rep_max",
        current: volumeToOneRepMax(set.weight, set.reps),
        full: volumeToOneRepMax(fullWeight, set.reps),
      },
      {
        type: "weight",
        current: set.weight,
        full: fullWeight,
      },
      {
        type: "volume",
        current: set.weight * set.reps,
        full: fullWeight * set.reps,
      },
    ];

    for (const currentRecord of currentRecords) {
      const previousRecord = queryPreviousRecordByExercise(
        store,
        currentRecord.type,
        set.exercise,
        performance.startedAt,
      );
      const isNewRecord =
        !previousRecord || compareRecords(currentRecord, previousRecord) > 0;

      if (isNewRecord) {
        addRecord(store, {
          id: generateId(),
          user: set.user,
          workout: set.workout,
          exercise: set.exercise,
          performance: set.performance,
          set: set.id,
          createdAt: performance.startedAt,
          type: currentRecord.type,
          previous: previousRecord?.current,
          current: currentRecord.current,
          full: currentRecord.full,
        });
      }
    }
  };

  const completeHandler = async () => {
    if (!set.completed) {
      const set = updateSetInner((set) => {
        const weight = set.weight ?? recSet?.weight;
        const reps = set.reps ?? recSet?.reps?.max;
        if (weight !== undefined && reps !== undefined) {
          return { ...set, weight, reps, completed: true };
        } else {
          return set;
        }
      });
      if (set.completed) {
        updateSet(store, set);
        addRecords(set);
        startTimer(performance.timer, timerAudio);
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

  const copyPreviousHandler = () => {
    if (prevSet && !set.completed) {
      const set = updateSetInner((set) => ({
        ...set,
        weight: prevSet.weight,
        reps: prevSet.reps,
      }));
      updateSet(store, set);
    }
  };

  return (
    <>
      <tr className={clsx(set.completed && s.completed)}>
        <td className={s.setNumValue} onClick={setInfoHandler}>
          {records.length === 0 ? (
            <span
              className={clsx({
                [s.warmUpSet]: set.type === "warm-up",
                [s.workingSet]: set.type === "working",
                [s.lightSet]: set.type === "light",
                [s.failureSet]: set.type === "failure",
              })}
            >
              {number}
            </span>
          ) : (
            <PiMedalFill className={s.recordMedal} />
          )}
        </td>
        <td className={s.prevVolumeValue} onClick={copyPreviousHandler}>
          {prev}
        </td>
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
      <BottomSheet isOpen={isRecordsOpen} onClose={() => setRecordsOpen(false)}>
        <div className={s.sheetHeader}>Новый рекорд</div>
        <div className={s.sheetRecords}>
          {records.map((r) => (
            <div className={s.sheetRecord} key={r.type}>
              <div className={s.recordType}>{RECORDS_TRANSLATION[r.type]}</div>
              <div className={s.recordValue}>
                {formatRecordValue(r.current)} кг
              </div>
              {r.previous !== undefined && (
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
