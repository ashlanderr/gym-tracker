import type { SetRowProps } from "./types.ts";
import s from "./styles.module.scss";
import { MdCheck } from "react-icons/md";
import { useModalStack, useStore } from "../../../../components";
import { useEffect, useRef, useState } from "react";
import {
  updateSet,
  type Set,
  useQueryRecordsBySet,
  type Record,
  type Performance,
} from "../../../../db";
import { clsx } from "clsx";
import { PiArrowDownBold, PiArrowUpBold, PiMedalFill } from "react-icons/pi";
import {
  addSelfWeight,
  kgToUnits,
  MEDAL_RECORDS,
  snapWeightKg,
  unitsToKg,
  updateRecords,
  volumeToOneRepMax,
} from "../../../../domain";
import { useActiveTimer } from "../ActiveTimer";
import { formatRepRange } from "./utils.ts";
import { RecordsBottomSheet } from "../RecordsBottomSheet";
import { SetActionsBottomSheet } from "../SetActionsBottomSheet";

export function SetRow({
  exercise,
  performance,
  number,
  set,
  prevSet,
  recSet,
}: SetRowProps) {
  const store = useStore();
  const { pushModal } = useModalStack();
  const [weightInput, setWeightInput] = useState<string | null>(null);
  const [repsInput, setRepsInput] = useState<string | null>(null);
  const records = useQueryRecordsBySet(store, set.id).filter((r) =>
    MEDAL_RECORDS.includes(r.type),
  );
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

  const reps = set.reps?.toString() ?? "";
  const repsPlaceholder = recSet?.reps ? formatRepRange(recSet.reps) : "-";

  const updateSetInner = (updater: (set: Set) => Set): Set => {
    updatedSet.current = updater(updatedSet.current);
    return updatedSet.current;
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

  const setInfoHandler = async () => {
    if (!set.completed) {
      await pushModal(SetActionsBottomSheet, {
        exercise,
        performance,
        set,
        recSet,
      });
    } else if (records.length !== 0) {
      await pushModal(RecordsBottomSheet, records);
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
