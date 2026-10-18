import type { SetRowProps } from "./types.ts";
import s from "./styles.module.scss";
import { MdCheck } from "react-icons/md";
import { showToast, useModalStack, useStore } from "../../../../components";
import {
  updateSet,
  type Set,
  useQueryRecordsBySet,
  type Record,
  queryRecordsByPerformance,
  type WeightUnits,
} from "../../../../db";
import { clsx } from "clsx";
import { useState } from "react";
import { PiArrowDownBold, PiArrowUpBold, PiMedalFill } from "react-icons/pi";
import {
  addSelfWeight,
  MEDAL_RECORDS,
  updateRecords,
  volumeToOneRepMax,
} from "../../../../domain";
import { useActiveTimer } from "../ActiveTimer";
import { formatRepRange } from "./utils.ts";
import { RecordsBottomSheet } from "../RecordsBottomSheet";
import { SetActionsBottomSheet } from "../SetActionsBottomSheet";
import { WeightSheet } from "../WeightSheet";
import { RepsSheet } from "../RepsSheet";
import { RecordNotice } from "../RecordNotice";
import { RECORD_NOTICE } from "../../../constants.ts";
import { formatWeightUnits } from "../../hooks.ts";

export function SetRow({
  exercise,
  performance,
  units,
  number,
  set,
  prevSet,
  recSet,
}: SetRowProps) {
  const store = useStore();
  const { pushModal } = useModalStack();
  const records = useQueryRecordsBySet(store, set.id).filter((r) =>
    MEDAL_RECORDS.includes(r.type),
  );
  const { startTimer } = useActiveTimer();
  const [flash, setFlash] = useState(false);

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

  const prev = prevSet
    ? `${formatWeightUnits(prevSet.weight, units)} × ${prevSet.reps}`
    : "–";

  const isWeightSuggested = set.weight === undefined;
  const weightKg = set.weight ?? recSet?.weight;
  const weight =
    weightKg !== undefined ? formatWeightUnits(weightKg, units) : "?";

  const isRepsSuggested = set.reps === undefined;
  const reps =
    set.reps?.toString() ?? (recSet?.reps ? formatRepRange(recSet.reps) : "–");

  const openWeight = async () => {
    if (set.completed) return;
    await pushModal(WeightSheet, { performance, setId: set.id });
  };

  const openReps = async () => {
    if (set.completed) return;
    await pushModal(RepsSheet, { performance, setId: set.id });
  };

  const completeHandler = async () => {
    if (set.completed) {
      const updated: Set = { ...set, completed: false };
      updateSet(store, updated);
      updateRecords(store, updated);
      return;
    }

    const weight = set.weight ?? recSet?.weight;
    const reps = set.reps ?? recSet?.reps?.max;

    // Nothing to fill the set with: ask for the missing number first.
    if (weight === undefined) return openWeight();
    if (reps === undefined) return openReps();

    const updated: Set = { ...set, weight, reps, completed: true };
    setFlash(true);
    updateSet(store, updated);
    updateRecords(store, updated);
    startTimer(performance.timer);
    announceRecords(
      queryRecordsByPerformance(store, performance.id),
      updated,
      units,
    );
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
      updateSet(store, {
        ...set,
        weight: prevSet.weight,
        reps: prevSet.reps,
      });
    }
  };

  return (
    <tr
      className={clsx(set.completed && s.completed, flash && s.flash)}
      onAnimationEnd={() => setFlash(false)}
    >
      <td className={s.setNumValue} onClick={setInfoHandler}>
        {renderSetBadge(set, number, records, localChange)}
      </td>
      <td className={s.prevVolumeValue} onClick={copyPreviousHandler}>
        {prev}
      </td>
      <td className={s.currentWeightValue}>
        <button
          className={clsx(s.cell, isWeightSuggested && s.suggested)}
          onClick={openWeight}
        >
          {weight}
        </button>
      </td>
      <td className={s.currentRepsValue}>
        <button
          className={clsx(s.cell, isRepsSuggested && s.suggested)}
          onClick={openReps}
        >
          {reps}
        </button>
      </td>
      <td className={s.setCompletedValue}>
        <button className={s.setCompletedButton} onClick={completeHandler}>
          <MdCheck />
        </button>
      </td>
    </tr>
  );
}

// A set that beats the best of earlier workouts says so at once. The first
// time an exercise is done there is nothing to beat, so it stays quiet.
function announceRecords(records: Record[], set: Set, units: WeightUnits) {
  records
    .filter((r) => r.set === set.id && r.previous !== undefined)
    .forEach((record) => {
      const title = RECORD_NOTICE[record.type];
      if (!title || record.previous === undefined) return;
      showToast(
        <RecordNotice
          title={title}
          current={record.current}
          previous={record.previous}
          units={units}
        />,
      );
    });
}

function renderSetBadge(
  set: Set,
  number: string,
  records: Record[],
  localChange: number | undefined,
) {
  if (records.length !== 0) {
    return <PiMedalFill className={s.recordMedal} />;
  }

  if (set.type !== "warm-up" && localChange) {
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
      })}
    >
      {number}
    </span>
  );
}
