import type { PerformanceProps } from "./types.ts";
import s from "./styles.module.scss";
import { MdAdd, MdCheck } from "react-icons/md";
import { type ReactNode } from "react";
import {
  useQuerySetsByPerformance,
  type Set,
  type CompletedSet,
  type Exercise,
  useQueryExerciseById,
  useQueryPreviousPerformance,
  type Performance,
  type Measurement,
  useQueryLatestMeasurement,
  type Record,
  useQueryPreviousRecordByExercise,
  DEFAULT_WEIGHT_UNITS,
  DEFAULT_EXERCISE_REPS,
} from "../../../../db";
import { useModalStack, useStore } from "../../../../components";
import { SetRow } from "../SetRow";
import { UNITS_TRANSLATION } from "../../../constants.ts";
import { PerformanceTimer } from "../PerformanceTimer";
import { assertNever } from "../../../../utils";
import { addNextSet, buildRecommendations } from "../../../../domain";
import { PerformanceActions } from "../PerformanceActions";
import { clsx } from "clsx";

export function Performance({
  performance,
  title,
  readonly,
  onShowActions,
}: PerformanceProps) {
  const store = useStore();
  const { pushModal } = useModalStack();
  const exercise = useQueryExerciseById(store, performance.exercise);
  const sets = useQuerySetsByPerformance(store, performance.id);
  const measurement = useQueryLatestMeasurement(store, performance.startedAt);

  const trainingMax = useQueryPreviousRecordByExercise(
    store,
    "training_max",
    performance.exercise,
    performance.startedAt - 1,
  );

  const oneRepMax = useQueryPreviousRecordByExercise(
    store,
    "one_rep_max",
    performance.exercise,
    performance.startedAt - 1,
  );

  const latestRepMax = selectLatestRepMax(trainingMax, oneRepMax);

  const prevPerformance = useQueryPreviousPerformance(
    store,
    performance.exercise,
    performance.startedAt,
    performance.periodization,
  );

  const prevSets = useQuerySetsByPerformance(
    store,
    prevPerformance?.id ?? "",
  ).filter((s) => s.completed);

  const units = performance?.weights?.units ?? DEFAULT_WEIGHT_UNITS;
  const unitsText = UNITS_TRANSLATION[units];

  const addSetHandler = () => {
    addNextSet(store, performance);
  };

  const actionsHandler = async () => {
    if (onShowActions) {
      onShowActions();
    } else {
      await pushModal(PerformanceActions, { performance, exercise });
    }
  };

  return (
    <div className={s.exercise}>
      <div
        className={clsx({
          [s.exerciseName]: true,
          [s.lightMode]: performance.periodization === "light",
          [s.mediumMode]: performance.periodization === "medium",
          [s.heavyMode]: performance.periodization === "heavy",
        })}
        onClick={actionsHandler}
      >
        {title ?? exercise?.name ?? "-"}
      </div>
      <div className={s.timer}>
        <PerformanceTimer performance={performance} readonly={readonly} />
      </div>
      <table className={s.sets}>
        <thead>
          <tr>
            <th className={s.setNumHeader}>Подх.</th>
            <th className={s.prevVolumeHeader}>Пред.</th>
            <th className={s.currentWeightHeader}>{unitsText}</th>
            <th className={s.currentRepsHeader}>Повт.</th>
            <th className={s.setCompletedHeader}>
              <MdCheck />
            </th>
          </tr>
        </thead>
        <tbody>
          {buildSets({
            prevSets,
            sets,
            performance,
            exercise,
            measurement,
            oneRepMax: latestRepMax,
            readonly,
          })}
        </tbody>
      </table>
      {!readonly && (
        <button className={s.addSetButton} onClick={addSetHandler}>
          <MdAdd />
          Добавить сет
        </button>
      )}
    </div>
  );
}

function buildSets({
  prevSets,
  sets,
  performance,
  exercise,
  measurement,
  oneRepMax,
  readonly,
}: {
  prevSets: CompletedSet[];
  sets: Set[];
  performance: Performance;
  exercise: Exercise | null;
  measurement: Measurement | null;
  oneRepMax: Record | null;
  readonly?: boolean;
}): ReactNode[] {
  const prevWarmUp = prevSets.filter((s) => s.type === "warm-up");
  const prevWorking = prevSets.filter((s) => s.type !== "warm-up");
  const recommendations = buildRecommendations({
    currentSets: sets,
    previousSets: prevSets,
    performanceWeights: performance.weights,
    exerciseWeights: exercise?.weight,
    exerciseReps: exercise?.reps ?? DEFAULT_EXERCISE_REPS,
    selfWeight: measurement?.weight,
    periodization: performance?.periodization,
    oneRepMax: oneRepMax ?? undefined,
  });

  const result: ReactNode[] = [];
  let warmUpIndex = 0;
  let workingIndex = 0;

  sets.forEach((set, index) => {
    let number = "-";
    let prevSet: CompletedSet | undefined;
    const recSet = recommendations[index];

    if (set.type === "warm-up") {
      number = "W";
    } else if (set.type === "working") {
      number = (workingIndex + 1).toString();
    } else if (set.type === "failure") {
      number = "F";
    } else if (set.type === "light") {
      number = "L";
    } else {
      assertNever(set.type);
    }

    if (set.type === "warm-up") {
      prevSet = prevWarmUp[warmUpIndex];
      warmUpIndex += 1;
    } else {
      prevSet = prevWorking[workingIndex];
      workingIndex += 1;
    }

    result.push(
      <SetRow
        exercise={exercise}
        performance={performance}
        key={set.id}
        number={number}
        set={set}
        prevSet={prevSet}
        recSet={recSet}
        readonly={readonly}
      />,
    );
  });

  return result;
}

function selectLatestRepMax(a: Record | null, b: Record | null): Record | null {
  if (!a) return b;
  if (!b) return a;
  return a.createdAt > b.createdAt ? a : b;
}
