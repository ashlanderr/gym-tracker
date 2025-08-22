import s from "./styles.module.scss";
import { MdAdd, MdArrowBack } from "react-icons/md";
import { clsx } from "clsx";
import {
  useQueryWorkoutById,
  addPerformance,
  queryPreviousPerformance,
  useQueryPerformancesByWorkout,
  generateId,
  querySetsByPerformance,
  useQuerySetsByWorkout,
  type Exercise,
} from "../../db";
import type { WorkoutParams } from "./types.ts";
import { usePageParams } from "../hooks.ts";
import { useState } from "react";
import { useNavigate } from "react-router";
import { useTimer } from "../hooks.ts";
import {
  Performance,
  ChooseExercise,
  CompleteWorkoutModal,
  type CompleteWorkoutData,
  ActiveTimer,
} from "./components";
import { PageModal, ModalDialog, useStore } from "../../components";
import { addNextSet, duplicateSet, completeWorkout } from "../../domain";

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
      loadout: prevPerformance?.loadout,
      timer: prevPerformance?.timer,
    });

    if (prevSets) {
      for (const oldSet of prevSets) {
        duplicateSet(store, performance, oldSet);
      }
    } else {
      addNextSet(store, performance);
    }
  };

  const completeBeginHandler = () => {
    const completed = sets.every((s) => s.completed);
    setCompleteModal(completed ? "form" : "warning");
  };

  const completeEndHandler = (data: CompleteWorkoutData) => {
    if (!workout) return;
    completeWorkout(store, workout, data.name);
    setCompleteModal(null);
    navigate("/", { replace: true });
  };

  return (
    <div className={s.root}>
      <ActiveTimer />
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
