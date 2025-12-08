import type { SetRowProps } from "./types.ts";
import s from "./styles.module.scss";
import {
  MdArrowDownward,
  MdArrowUpward,
  MdCheck,
  MdDelete,
} from "react-icons/md";
import { BottomSheet, useStore } from "../../../../components";
import { useEffect, useRef, useState } from "react";
import {
  deleteSet,
  type SetType,
  updateSet,
  type Set,
  useQueryRecordsBySet,
  type Record,
  type Performance,
} from "../../../../db";
import { clsx } from "clsx";
import { RECORDS_TRANSLATION } from "../../../constants.ts";
import { PiArrowDownBold, PiArrowUpBold, PiMedalFill } from "react-icons/pi";
import {
  addSelfWeight,
  formatRecordValue,
  kgToUnits,
  snapWeightKg,
  unitsToKg,
  updateRecords,
  volumeToOneRepMax,
} from "../../../../domain";
import { WeightsVisualizer } from "../WeightsVisualizer";
import { useActiveTimer } from "../ActiveTimer";
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
  const { startTimer } = useActiveTimer();

  const prevOneRepMax = prevSet
    ? volumeToOneRepMax(
        addSelfWeight(exercise?.weight, undefined, prevSet.weight),
        prevSet.reps,
      )
    : undefined;
  const currOneRepMax = set.completed
    ? volumeToOneRepMax(
        addSelfWeight(exercise?.weight, undefined, set.weight),
        set.reps,
      )
    : undefined;
  const localChange =
    prevOneRepMax !== undefined && currOneRepMax !== undefined
      ? currOneRepMax - prevOneRepMax
      : undefined;

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
    deleteSet(store, set);
    updateRecords(store, set);
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
        updateRecords(store, set);
        startTimer(performance.timer);
      }
    } else {
      const set = updateSetInner((set) => ({ ...set, completed: false }));
      updateSet(store, set);
      updateRecords(store, set);
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
          {renderSetBadge(performance, set, number, records, localChange)}
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
                {formatRecordValue(r.current)}
              </div>
              {r.previous !== undefined && (
                <div
                  className={clsx({
                    [s.recordDelta]: true,
                    [s.increment]: r.current > r.previous,
                    [s.decrement]: r.current < r.previous,
                  })}
                >
                  {r.current > r.previous ? (
                    <MdArrowUpward />
                  ) : (
                    <MdArrowDownward />
                  )}
                  {formatRecordValue(Math.abs(r.current - r.previous))}
                </div>
              )}
            </div>
          ))}
        </div>
      </BottomSheet>
    </>
  );
}

function renderSetBadge(
  performance: Performance,
  set: Set,
  number: string,
  records: Record[],
  localChange: number | undefined,
) {
  if (records.length !== 0) {
    return <PiMedalFill className={s.recordMedal} />;
  }

  if (!performance.periodization && set.type !== "warm-up" && localChange) {
    if (localChange > 0) {
      return <PiArrowUpBold className={s.increment} />;
    }
    if (localChange < 0) {
      return <PiArrowDownBold className={s.decrement} />;
    }
  }

  return (
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
  );
}
