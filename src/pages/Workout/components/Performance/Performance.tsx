import type { PerformanceProps } from "./types.ts";
import s from "./styles.module.scss";
import {
  MdAdd,
  MdAutorenew,
  MdBarChart,
  MdCheck,
  MdDelete,
  MdEdit,
  MdSwapVert,
} from "react-icons/md";
import { type ReactNode, useState } from "react";
import {
  useQuerySetsByPerformance,
  type Set,
  type CompletedSet,
  type Exercise,
  useQueryExerciseById,
  queryPerformancesByWorkout,
  updatePerformance,
  useQueryPreviousPerformance,
  type Performance,
  type PerformanceWeights,
  DEFAULT_AUTO_WEIGHTS,
  type Measurement,
  useQueryLatestMeasurement,
  useQueryWorkoutById,
  type Workout,
  type Record,
  useQueryPreviousRecordByExercise,
} from "../../../../db";
import { BottomSheet, PageModal, useStore } from "../../../../components";
import { ChooseExercise } from "../ChooseExercise";
import { SetRow } from "../SetRow";
import { PerformanceOrder } from "../PerformanceOrder";
import { ExerciseHistory } from "../ExerciseHistory";
import { clsx } from "clsx";
import { WeightsSelector } from "../WeightsSelector";
import { UNITS_TRANSLATION } from "../../../constants.ts";
import { AddExercise } from "../AddExercise";
import { PerformanceTimer } from "../PerformanceTimer";
import { assertNever } from "../../../../utils";
import {
  addNextSet,
  deletePerformance,
  replacePerformance,
  buildRecommendations,
  switchUnits,
} from "../../../../domain";

export function Performance({ performance }: PerformanceProps) {
  const store = useStore();
  const exercise = useQueryExerciseById(store, performance.exercise);
  const sets = useQuerySetsByPerformance(store, performance.id);
  const measurement = useQueryLatestMeasurement(store, performance.startedAt);
  const workout = useQueryWorkoutById(store, performance.workout);
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
  );
  const prevSets = useQuerySetsByPerformance(
    store,
    prevPerformance?.id ?? "",
  ).filter((s) => s.completed);

  const [isActionsOpen, setActionsOpen] = useState(false);
  const [isReplaceOpen, setReplaceOpen] = useState(false);
  const [isHistoryOpen, setHistoryOpen] = useState(false);
  const [orderState, setOrderState] = useState<Performance[]>([]);
  const [editState, setEditState] = useState<Exercise | null>(null);

  const weights = performance.weights ?? DEFAULT_AUTO_WEIGHTS;
  const unitsText = UNITS_TRANSLATION[weights.units];

  const addSetHandler = () => {
    addNextSet(store, performance);
  };

  const historyHandler = () => {
    setActionsOpen(false);
    setHistoryOpen(true);
  };

  const orderBeginHandler = () => {
    setActionsOpen(false);
    setOrderState(queryPerformancesByWorkout(store, performance.workout));
  };

  const orderCompleteHandler = (items: Performance[]) => {
    items.forEach((p) => updatePerformance(store, p));
    setOrderState([]);
  };

  const replaceBeginHandler = () => {
    setActionsOpen(false);
    setReplaceOpen(true);
  };

  const editBeginHandler = () => {
    if (!exercise) return;
    setActionsOpen(false);
    setEditState(exercise);
  };

  const replaceCompleteHandler = (exercise: Exercise) => {
    replacePerformance(store, performance, exercise.id);
    setReplaceOpen(false);
  };

  const deleteHandler = () => {
    deletePerformance(store, performance);
    setActionsOpen(false);
  };

  const weightsChangeHandler = (weights: PerformanceWeights | undefined) => {
    updatePerformance(store, { ...performance, weights });
  };

  const switchUnitsHandler = () => {
    if (weights.auto) {
      updatePerformance(store, {
        ...performance,
        weights: {
          ...DEFAULT_AUTO_WEIGHTS,
          units: switchUnits(weights.units),
        },
      });
    }
  };

  return (
    <div className={s.exercise}>
      <div className={s.exerciseName} onClick={() => setActionsOpen(true)}>
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
            <th className={s.currentWeightHeader} onClick={switchUnitsHandler}>
              {unitsText}
            </th>
            <th className={s.currentRepsHeader}>Повт.</th>
            <th className={s.setCompletedHeader}>
              <MdCheck />
            </th>
          </tr>
        </thead>
        <tbody>
          {buildSets({
            prevPerformance,
            prevSets,
            sets,
            performance,
            exercise,
            measurement,
            workout,
            oneRepMax,
          })}
        </tbody>
      </table>
      <button className={s.addSetButton} onClick={addSetHandler}>
        <MdAdd />
        Добавить сет
      </button>
      <BottomSheet isOpen={isActionsOpen} onClose={() => setActionsOpen(false)}>
        <div className={s.sheetHeader}>Упражнение</div>
        {exercise?.equipment && (
          <div className={s.sheetWeights}>
            <WeightsSelector
              equipment={exercise.equipment}
              value={weights}
              onChange={weightsChangeHandler}
            />
          </div>
        )}
        <div className={s.sheetActions}>
          <button className={s.sheetAction} onClick={historyHandler}>
            <MdBarChart />
            <span>История выполнения</span>
          </button>
          <button className={s.sheetAction} onClick={orderBeginHandler}>
            <MdSwapVert />
            <span>Порядок выполнения</span>
          </button>
          <button className={s.sheetAction} onClick={replaceBeginHandler}>
            <MdAutorenew />
            <span>Заменить на другое</span>
          </button>
          <button className={s.sheetAction} onClick={editBeginHandler}>
            <MdEdit />
            <span>Изменить упражнение</span>
          </button>
          <button
            className={clsx(s.sheetAction, s.danger)}
            onClick={deleteHandler}
          >
            <MdDelete />
            <span>Удалить из тренировки</span>
          </button>
        </div>
      </BottomSheet>
      <PageModal isOpen={isReplaceOpen}>
        <ChooseExercise
          onCancel={() => setReplaceOpen(false)}
          onSubmit={replaceCompleteHandler}
        />
      </PageModal>
      {exercise && (
        <PageModal isOpen={isHistoryOpen}>
          <ExerciseHistory
            exercise={exercise}
            onClose={() => setHistoryOpen(false)}
          />
        </PageModal>
      )}
      <PageModal isOpen={orderState.length !== 0}>
        <PerformanceOrder
          performances={orderState}
          onCancel={() => setOrderState([])}
          onSubmit={orderCompleteHandler}
        />
      </PageModal>
      {editState && (
        <PageModal isOpen={true}>
          <AddExercise
            exercise={editState}
            onCancel={() => setEditState(null)}
            onSubmit={() => setEditState(null)}
          />
        </PageModal>
      )}
    </div>
  );
}

function buildSets({
  prevPerformance,
  prevSets,
  sets,
  performance,
  exercise,
  measurement,
  workout,
  oneRepMax,
}: {
  prevPerformance: Performance | null;
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
    prevSets,
    currentSets: sets,
    performanceWeights: performance.weights,
    exerciseWeights: exercise?.weight,
    selfWeight: measurement?.weight,
    progression: prevPerformance?.progression,
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
