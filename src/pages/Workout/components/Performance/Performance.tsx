import type { PerformanceProps } from "./types.ts";
import s from "./styles.module.scss";
import {
  MdAdd,
  MdAutorenew,
  MdBarChart,
  MdCheck,
  MdDelete,
  MdSwapVert,
} from "react-icons/md";
import { type ReactNode, useState } from "react";
import {
  useQuerySetsByPerformance,
  type Set,
  addSet,
  deleteSet,
  querySetsByPerformance,
} from "../../../../db/sets.ts";
import {
  type Exercise,
  useQueryExerciseById,
} from "../../../../db/exercises.ts";
import { BottomSheet } from "../BottomSheet";
import { ChooseExercise } from "../ChooseExercise";
import { PageModal } from "../PageModal";
import {
  deletePerformance,
  queryPerformancesByWorkout,
  updatePerformance,
  useQueryPreviousPerformance,
  type Performance,
} from "../../../../db/performances.ts";
import { buildRecommendations } from "./utils.ts";
import { SetRow } from "../SetRow";
import { generateId } from "../../../../db/db.ts";
import {
  deleteRecord,
  queryRecordsByPerformance,
} from "../../../../db/records.ts";
import { useStore } from "../../../../components";
import { PerformanceOrder } from "../PerformanceOrder";
import { ExerciseHistory } from "../ExerciseHistory";

export function Performance({ performance }: PerformanceProps) {
  const store = useStore();
  const exercise = useQueryExerciseById(store, performance.exercise);
  const sets = useQuerySetsByPerformance(store, performance.id);

  const prevPerformance = useQueryPreviousPerformance(
    store,
    performance.exercise,
    performance.startedAt,
  );
  const prevSets = useQuerySetsByPerformance(store, prevPerformance?.id ?? "");

  const [isActionsOpen, setActionsOpen] = useState(false);
  const [isReplaceOpen, setReplaceOpen] = useState(false);
  const [isHistoryOpen, setHistoryOpen] = useState(false);
  const [orderState, setOrderState] = useState<Performance[]>([]);

  const addSetHandler = () => {
    addSet(store, {
      id: generateId(),
      user: performance.user,
      workout: performance.workout,
      exercise: performance.exercise,
      performance: performance.id,
      order: Math.max(-1, ...sets.map((s) => s.order)) + 1,
      type: "working",
      weight: 0,
      reps: 0,
      completed: false,
    });
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

  const replaceCompleteHandler = (exercise: Exercise) => {
    const sets = querySetsByPerformance(store, performance.id);
    const records = queryRecordsByPerformance(store, performance.id);

    records.forEach((record) => deleteRecord(store, record));
    sets.forEach((set) => deleteSet(store, set));
    updatePerformance(store, { ...performance, exercise: exercise.id });

    setReplaceOpen(false);
  };

  const deleteHandler = () => {
    const sets = querySetsByPerformance(store, performance.id);
    const records = queryRecordsByPerformance(store, performance.id);

    records.forEach((record) => deleteRecord(store, record));
    sets.forEach((set) => deleteSet(store, set));
    deletePerformance(store, performance);

    setActionsOpen(false);
  };

  return (
    <div className={s.exercise}>
      <div className={s.exerciseName} onClick={() => setActionsOpen(true)}>
        {exercise?.name ?? "-"}
      </div>
      <table className={s.sets}>
        <thead>
          <tr>
            <th className={s.setNumHeader}>Подх.</th>
            <th className={s.prevVolumeHeader}>Пред.</th>
            <th className={s.currentWeightHeader}>КГ</th>
            <th className={s.currentRepsHeader}>Повт.</th>
            <th className={s.setCompletedHeader}>
              <MdCheck />
            </th>
          </tr>
        </thead>
        <tbody>{buildSets(prevSets, sets)}</tbody>
      </table>
      <button className={s.addSetButton} onClick={addSetHandler}>
        <MdAdd />
        Добавить сет
      </button>
      <BottomSheet isOpen={isActionsOpen} onClose={() => setActionsOpen(false)}>
        <div className={s.sheetHeader}>Упражнение</div>
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
          <button className={s.sheetAction} onClick={deleteHandler}>
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
    </div>
  );
}

function buildSets(prevSets: Set[], sets: Set[]): ReactNode[] {
  const prevWarmUp = prevSets.filter(
    (s) => s.type === "warm-up" && s.weight && s.reps,
  );
  const prevWorking = prevSets.filter(
    (s) => s.type === "working" && s.weight && s.reps,
  );
  const recommendations = buildRecommendations(prevSets, sets);

  const result: ReactNode[] = [];
  let warmUpIndex = 0;
  let workingIndex = 0;

  sets.forEach((set, index) => {
    let number = "-";
    let prevSet: Set | undefined;
    const recSet = recommendations[index];

    if (set.type === "warm-up") {
      number = "W";
      prevSet = prevWarmUp[warmUpIndex];
      warmUpIndex += 1;
    } else if (set.type === "working") {
      number = (workingIndex + 1).toString();
      prevSet = prevWorking[workingIndex];
      workingIndex += 1;
    }

    result.push(
      <SetRow
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
