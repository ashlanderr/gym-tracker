import s from "./styles.module.scss";
import { MdAdd, MdArrowBack } from "react-icons/md";
import { clsx } from "clsx";
import { updateWorkout, useQueryWorkoutById } from "../../db/workouts.ts";
import type { WorkoutParams } from "./types.ts";
import { usePageParams } from "../hooks.ts";
import { useState } from "react";
import { PageModal } from "./components/PageModal";
import { ModalDialog } from "./components/ModalDialog";
import {
  type CompleteWorkoutData,
  CompleteWorkoutModal,
} from "./components/CompleteWorkoutModal";
import { useNavigate } from "react-router";
import { useTimer } from "../hooks.ts";
import {
  addPerformance,
  deletePerformance,
  queryPreviousPerformance,
  useQueryPerformancesByWorkout,
} from "../../db/performances.ts";
import { Performance } from "./components";
import { ChooseExercise } from "./components/ChooseExercise";
import { generateId } from "../../db/db.ts";
import {
  addSet,
  deleteSet,
  querySetsByPerformance,
  useQuerySetsByWorkout,
} from "../../db/sets.ts";
import type { Exercise } from "../../db/exercises.ts";
import { useStore } from "../../components";
import { queryRecordsByWorkout } from "../../db/records.ts";

export function Workout() {
  const { workoutId } = usePageParams<WorkoutParams>();
  const store = useStore();
  const navigate = useNavigate();
  const workout = useQueryWorkoutById(store, workoutId);
  const timer = useTimer(
    workout?.startedAt ?? null,
    workout?.completedAt ?? null,
  );
  const performances = useQueryPerformancesByWorkout(store, workoutId);
  const sets = useQuerySetsByWorkout(store, workoutId);
  const completedSets = sets.filter((s) => s.completed);
  const volume = completedSets.reduce((v, s) => v + s.weight * s.reps, 0);
  const [isAddPerformanceOpen, setAddPerformanceOpen] = useState(false);
  const [completeModal, setCompleteModal] = useState<"warning" | "form" | null>(
    null,
  );

  // todo access rules

  const addPerformanceHandler = (exercise: Exercise) => {
    if (!workout) return;

    setAddPerformanceOpen(false);

    const prevPerformance = queryPreviousPerformance(
      store,
      exercise.id,
      Date.now(),
    );

    const prevSets =
      prevPerformance && querySetsByPerformance(store, prevPerformance.id);

    const performance = addPerformance(store, {
      id: generateId(),
      user: workout.user,
      workout: workout.id,
      exercise: exercise.id,
      order: Math.max(-1, ...performances.map((p) => p.order)) + 1,
      startedAt: workout.startedAt,
      weights: prevPerformance?.weights,
    });

    if (prevSets) {
      for (const set of prevSets) {
        addSet(store, {
          id: generateId(),
          user: workout.user,
          workout: workout.id,
          performance: performance.id,
          exercise: performance.exercise,
          order: set.order,
          type: set.type,
          weight: 0,
          reps: 0,
          completed: false,
        });
      }
    } else {
      addSet(store, {
        id: generateId(),
        user: workout.user,
        workout: workout.id,
        performance: performance.id,
        exercise: performance.exercise,
        order: 0,
        type: "working",
        weight: 0,
        reps: 0,
        completed: false,
      });
    }
  };

  const completeBeginHandler = () => {
    const completed = sets.every((s) => s.completed);
    setCompleteModal(completed ? "form" : "warning");
  };

  const completeEndHandler = (data: CompleteWorkoutData) => {
    if (!workout) return;

    for (const performance of performances) {
      const performanceSets = sets.filter(
        (s) => s.performance === performance.id,
      );
      let emptyPerformance = true;

      for (const set of performanceSets) {
        if (!set.completed) {
          deleteSet(store, set);
        } else {
          emptyPerformance = false;
        }
      }

      if (emptyPerformance) {
        deletePerformance(store, performance);
      }
    }

    const records = queryRecordsByWorkout(store, workout.id);

    updateWorkout(store, {
      ...workout,
      completedAt: workout.completedAt ?? Date.now(),
      name: data.name,
      sets: completedSets.length,
      records: records.length !== 0 ? records.length : undefined,
      volume,
    });

    setCompleteModal(null);
    navigate("/", { replace: true });
  };

  return (
    <div className={s.root}>
      <div className={s.toolbar}>
        <button
          className={s.backButton}
          onClick={() => navigate("/", { replace: true })}
        >
          <MdArrowBack />
        </button>
        <div className={s.pageTitle}>Тренировка</div>
        <button className={s.finishButton} onClick={completeBeginHandler}>
          {workout?.completedAt ? "Обновить" : "Закончить"}
        </button>
      </div>
      <div className={s.stats}>
        <div className={s.stat}>
          <div className={s.statName}>Время</div>
          <div className={clsx(s.statValue, s.accent)}>{timer}</div>
        </div>
        <div className={s.stat}>
          <div className={s.statName}>Объём</div>
          <div className={s.statValue}>
            {Math.round(volume).toLocaleString()} кг
          </div>
        </div>
        <div className={s.stat}>
          <div className={s.statName}>Сеты</div>
          <div className={s.statValue}>
            {completedSets.length} / {sets.length}
          </div>
        </div>
      </div>
      <div className={s.exercises}>
        {performances.map((performance) => (
          <Performance key={performance.id} performance={performance} />
        ))}
        <button
          className={s.addExerciseButton}
          onClick={() => setAddPerformanceOpen(true)}
        >
          <MdAdd />
          Добавить упражнение
        </button>
      </div>
      <PageModal isOpen={isAddPerformanceOpen}>
        <ChooseExercise
          onCancel={() => setAddPerformanceOpen(false)}
          onSubmit={addPerformanceHandler}
        />
      </PageModal>
      <ModalDialog
        title="Подтверждение"
        width="300px"
        cancelText="Отмена"
        submitText="Завершить"
        isOpen={completeModal === "warning"}
        onClose={() => setCompleteModal(null)}
        onSubmit={() => setCompleteModal("form")}
      >
        Не все сеты выполнены. Вы точно ходите завершить тренировку?
      </ModalDialog>
      {workout && (
        <CompleteWorkoutModal
          workout={workout}
          isOpen={completeModal === "form"}
          onClose={() => setCompleteModal(null)}
          onSubmit={completeEndHandler}
        />
      )}
    </div>
  );
}
