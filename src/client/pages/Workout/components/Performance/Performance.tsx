import type { PerformanceProps } from "./types.ts";
import s from "./styles.module.scss";
import { MdAdd, MdCheck } from "react-icons/md";
import { type ReactNode } from "react";
import { useNavigate } from "react-router";
import {
  useQuerySetsByPerformance,
  type Set,
  type CompletedSet,
  type Exercise,
  useQueryExerciseById,
  useQueryPreviousPerformance,
  type Performance,
  useQueryCurrentGym,
  type Gym,
} from "../../../../db";
import { ExerciseThumb, useModalStack, useStore } from "../../../../components";
import { SetRow } from "../SetRow";
import { UNITS_TRANSLATION } from "../../../constants.ts";
import { PerformanceTimer } from "../PerformanceTimer";
import { assertNever } from "../../../../utils";
import {
  addNextSet,
  getWeightUnits,
  type RecSetData,
} from "../../../../domain";
import { usePerformanceRecommendations } from "../../hooks.ts";
import { PerformanceActions } from "../PerformanceActions";

export function Performance({ performance, currentSet }: PerformanceProps) {
  const store = useStore();
  const { pushModal } = useModalStack();
  const navigate = useNavigate();
  const exercise = useQueryExerciseById(store, performance.exercise);
  const gym = useQueryCurrentGym(store, performance.user);
  const plan = usePerformanceRecommendations(performance);

  const prevPerformance = useQueryPreviousPerformance(
    store,
    performance.slot,
    performance.exercise,
    performance.startedAt,
  );

  const prevSets = useQuerySetsByPerformance(
    store,
    prevPerformance?.id ?? "",
  ).filter((s) => s.completed);

  if (!exercise || !plan) return null;

  const units = getWeightUnits(exercise, gym);
  const unitsText = UNITS_TRANSLATION[units];

  const addSetHandler = () => {
    addNextSet(store, performance);
  };

  const actionsHandler = async () => {
    await pushModal(PerformanceActions, { performance, exercise });
  };

  const exerciseHandler = () => {
    navigate(`/exercises/${exercise.id}?performance=${performance.id}`);
  };

  return (
    <div className={s.exercise}>
      <div className={s.header}>
        <ExerciseThumb exercise={exercise} onClick={exerciseHandler} />
        <div className={s.title}>
          <div className={s.exerciseName} onClick={actionsHandler}>
            {exercise.name}
          </div>
          <PerformanceTimer performance={performance} />
        </div>
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
            sets: plan.sets,
            recommendations: plan.recommendations,
            performance,
            exercise,
            gym,
            currentSet,
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
  recommendations,
  performance,
  exercise,
  gym,
  currentSet,
}: {
  prevSets: CompletedSet[];
  sets: Set[];
  recommendations: RecSetData[];
  performance: Performance;
  exercise: Exercise;
  gym: Gym;
  currentSet: string | undefined;
}): ReactNode[] {
  const prevWarmUp = prevSets.filter((s) => s.type === "warm-up");
  const prevWorking = prevSets.filter((s) => s.type !== "warm-up");

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
        gym={gym}
        performance={performance}
        key={set.id}
        number={number}
        set={set}
        isCurrent={set.id === currentSet}
        prevSet={prevSet}
        recSet={recSet}
      />,
    );
  });

  return result;
}
