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
  useQueryWorkoutById,
  type Workout,
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
import {
  addNextSet,
  buildRecommendations,
  getCurrentPeriodization,
} from "../../../../domain";
import { PerformanceActions } from "../PerformanceActions";

export function Performance({ performance }: PerformanceProps) {
  const store = useStore();
  const { pushModal } = useModalStack();
  const exercise = useQueryExerciseById(store, performance.exercise);
  const sets = useQuerySetsByPerformance(store, performance.id);
  const measurement = useQueryLatestMeasurement(store, performance.startedAt);
  const workout = useQueryWorkoutById(store, performance.workout);

  const periodization =
    workout?.periodization && getCurrentPeriodization(workout.periodization);

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

  const prevPerformance = useQueryPreviousPerformance(
    store,
    performance.exercise,
    performance.startedAt,
    periodization,
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
    await pushModal(PerformanceActions, { performance, exercise });
  };

  return (
    <div className={s.exercise}>
      <div className={s.exerciseName} onClick={actionsHandler}>
        {exercise?.name ?? "-"}
      </div>
      <div className={s.timer}>
        <PerformanceTimer performance={performance} />
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
            workout,
            oneRepMax: trainingMax ?? oneRepMax,
          })}
        </tbody>
      </table>
      <button className={s.addSetButton} onClick={addSetHandler}>
        <MdAdd />
        Добавить сет
      </button>
    </div>
  );
}

function buildSets({
  prevSets,
  sets,
  performance,
  exercise,
  measurement,
  workout,
  oneRepMax,
}: {
  prevSets: CompletedSet[];
  sets: Set[];
  performance: Performance;
  exercise: Exercise | null;
  measurement: Measurement | null;
  workout: Workout | null;
  oneRepMax: Record | null;
}): ReactNode[] {
  const prevWarmUp = prevSets.filter(
    (s) => s.type === "warm-up" && s.completed,
  );
  const prevWorking = prevSets.filter(
    (s) => s.type !== "warm-up" && s.completed,
  );
  const recommendations = buildRecommendations({
    currentSets: sets,
    performanceWeights: performance.weights,
    exerciseWeights: exercise?.weight,
    exerciseReps: exercise?.reps ?? DEFAULT_EXERCISE_REPS,
    selfWeight: measurement?.weight,
    periodization: workout?.periodization,
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
      />,
    );
  });

  return result;
}
