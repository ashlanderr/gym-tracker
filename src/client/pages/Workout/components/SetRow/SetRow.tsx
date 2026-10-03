import type { SetRowProps } from "./types.ts";
import s from "./styles.module.scss";
import { MdCheck } from "react-icons/md";
import { useModalStack, useStore } from "../../../../components";
import {
  updateSet,
  type CompletedSet,
  type Set,
  useQueryRecordsBySet,
  type Record,
} from "../../../../db";
import { clsx } from "clsx";
import { PiArrowDownBold, PiArrowUpBold, PiMedalFill } from "react-icons/pi";
import {
  addSelfWeight,
  getWeightUnits,
  kgToUnits,
  MEDAL_RECORDS,
  updateRecords,
  volumeToOneRepMax,
  warmUpAfterWeightChange,
} from "../../../../domain";
import { useActiveTimer } from "../ActiveTimer";
import { formatRepRange } from "./utils.ts";
import { RecordsBottomSheet } from "../RecordsBottomSheet";
import { SetActionsBottomSheet } from "../SetActionsBottomSheet";
import { WeightSheet } from "../WeightSheet";
import { RepsSheet } from "../RepsSheet";
import { EffortSheet } from "../EffortSheet";

export function SetRow({
  exercise,
  gym,
  performance,
  number,
  set,
  isCurrent,
  isLastWorking,
  prevSet,
  recSet,
}: SetRowProps) {
  const store = useStore();
  const { pushModal } = useModalStack();
  const records = useQueryRecordsBySet(store, set.id).filter((r) =>
    MEDAL_RECORDS.includes(r.type),
  );
  const { startTimer } = useActiveTimer();

  const prevOneRepMax = prevSet
    ? volumeToOneRepMax(
        addSelfWeight(exercise.weight, undefined, prevSet.weight),
        prevSet.reps,
      )
    : undefined;
  const currOneRepMax = set.completed
    ? volumeToOneRepMax(
        addSelfWeight(exercise.weight, undefined, set.weight),
        set.reps,
      )
    : undefined;
  const localChange =
    prevOneRepMax !== undefined && currOneRepMax !== undefined
      ? currOneRepMax - prevOneRepMax
      : undefined;

  const units = getWeightUnits(exercise, gym);

  const convertWeight = (weightKg: number | undefined): number | undefined => {
    return weightKg !== undefined
      ? Math.round(kgToUnits(weightKg, units) * 100) / 100
      : undefined;
  };

  const prev = prevSet
    ? `${convertWeight(prevSet.weight)} x ${prevSet.reps}`
    : "-";

  const weight = convertWeight(set.weight ?? recSet?.weight) ?? "-";
  const reps =
    set.reps ?? (recSet?.reps ? formatRepRange(recSet.reps) : undefined) ?? "-";

  const sheetData = { performance, setId: set.id };

  // The sheet writes the weight on every press, so a warm-up the new weight
  // brings can only be inserted once it is closed.
  const weightHandler = async () => {
    await pushModal(WeightSheet, sheetData);
    warmUpAfterWeightChange(store, performance);
  };

  const repsHandler = () => pushModal(RepsSheet, sheetData);

  const completeHandler = async () => {
    if (set.completed) {
      const draft: Set = { ...set, completed: false };
      updateSet(store, draft);
      updateRecords(store, draft);
      return;
    }

    const weight = set.weight ?? recSet?.weight;
    if (weight === undefined) {
      await weightHandler();
      return;
    }

    const completed: CompletedSet = {
      ...set,
      weight,
      reps: set.reps ?? recSet?.reps?.max ?? performance.reps.max,
      completed: true,
      effort: undefined,
    };
    updateSet(store, completed);
    updateRecords(store, completed);
    startTimer(performance.timer);

    // TODO: ask after the last set only when it reached the top of the range,
    // so the next workout would raise the weight. Progression doesn't read
    // the rating yet, see TODO.md.
    const isFinding = recSet?.isFinding ?? false;
    if (isFinding || isLastWorking) {
      await pushModal(EffortSheet, { set: completed, isFinding });
    }
  };

  const setInfoHandler = async () => {
    if (!set.completed) {
      await pushModal(SetActionsBottomSheet, {
        exercise,
        gym,
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
    <tr className={clsx(set.completed && s.completed, isCurrent && s.current)}>
      <td className={s.setNumValue} onClick={setInfoHandler}>
        {renderSetBadge(set, number, records, localChange)}
      </td>
      <td className={s.prevVolumeValue} onClick={copyPreviousHandler}>
        {prev}
      </td>
      <td className={s.currentWeightValue}>
        <button
          className={clsx(s.value, set.weight === undefined && s.suggested)}
          disabled={set.completed}
          onClick={weightHandler}
        >
          {weight}
        </button>
      </td>
      <td className={s.currentRepsValue}>
        <button
          className={clsx(s.value, set.reps === undefined && s.suggested)}
          disabled={set.completed}
          onClick={repsHandler}
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
