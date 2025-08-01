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
import {
  useQuerySetsByPerformance,
  type Set,
  addSet,
  deleteSet,
} from "../../../../db/sets.ts";
import { type ReactNode, useState } from "react";
import {
  deletePerformance,
  updatePerformance,
  useQueryPreviousPerformance,
} from "../../../../db/performances.ts";
import {
  type Exercise,
  useQueryExerciseById,
} from "../../../../db/exercises.ts";
import { SetRow } from "../SetRow";
import { generateFirestoreId } from "../../../../db/db.ts";
import { BottomSheet } from "../BottomSheet";
import { ChooseExercise } from "../ChooseExercise";
import { PageModal } from "../PageModal";
import { buildRecommendations } from "./utils.ts";

export function Performance({ performance }: PerformanceProps) {
  const exercise = useQueryExerciseById(performance.exercise);
  const sets = useQuerySetsByPerformance({
    user: performance.user,
    performance: performance.id,
  });

  const prevPerformance = useQueryPreviousPerformance(
    performance.user,
    performance.exercise,
    performance.startedAt,
  );

  const prevSets = useQuerySetsByPerformance({
    enabled: prevPerformance?.id !== undefined,
    user: prevPerformance?.user,
    performance: prevPerformance?.id,
  });

  const [isActionsOpen, setActionsOpen] = useState(false);
  const [isReplaceOpen, setReplaceOpen] = useState(false);

  const addSetHandler = async () => {
    await addSet({
      id: generateFirestoreId(),
      user: performance.user,
      workout: performance.workout,
      performance: performance.id,
      order: Math.max(-1, ...sets.map((s) => s.order)) + 1,
      type: "working",
      weight: 0,
      reps: 0,
      completed: false,
    });
  };

  const statsHandler = () => {
    // todo
    alert("TBD");
  };

  const orderHandler = () => {
    // todo
    alert("TBD");
  };

  const replaceBeginHandler = () => {
    setActionsOpen(false);
    setReplaceOpen(true);
  };

  const replaceCompleteHandler = async (exercise: Exercise) => {
    setReplaceOpen(false);
    await updatePerformance({ ...performance, exercise: exercise.id });
  };

  const deleteHandler = async () => {
    setActionsOpen(false);
    await Promise.all([
      ...sets.map((s) => deleteSet(s)),
      deletePerformance(performance),
    ]);
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
          <button className={s.sheetAction} onClick={statsHandler}>
            <MdBarChart />
            <span>История выполнения</span>
          </button>
          <button className={s.sheetAction} onClick={orderHandler}>
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
