import s from "./styles.module.scss";
import { MdAdd, MdArrowBack } from "react-icons/md";
import {
  useQueryWorkoutById,
  useQueryPerformancesByWorkout,
  useQuerySetsByWorkout,
  type Exercise,
  updateWorkout,
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
  ActiveTimer,
  PeriodizationSelector,
  type PeriodizationOrNone,
  MODE_OPTIONS,
} from "./components";
import { PageModal, useStore, useModalStack } from "../../components";
import {
  completeWorkout,
  getCurrentPeriodization,
  buildPeriodization,
  addPerformance,
} from "../../domain";
import { clsx } from "clsx";

export function Workout() {
  const { workoutId } = usePageParams<WorkoutParams>();
  const store = useStore();
  const navigate = useNavigate();
  const { pushModal } = useModalStack();
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

  const currentMode: PeriodizationOrNone = workout?.periodization
    ? getCurrentPeriodization(workout.periodization)
    : "none";

  const addPerformanceHandler = (exercise: Exercise) => {
    if (!workout) return;
    addPerformance(store, workout, exercise.id);
    setAddPerformanceOpen(false);
  };

  const completeHandler = async () => {
    if (!workout) return;
    const partial = sets.some((s) => !s.completed);
    const result = await pushModal(CompleteWorkoutModal, { workout, partial });
    if (result) {
      completeWorkout(store, workout, result.name);
      navigate("/", { replace: true });
    }
  };

  const handleSelectPeriodization = async () => {
    if (!workout) return;

    const result = await pushModal(PeriodizationSelector, null);
    if (!result) return;

    updateWorkout(store, {
      ...workout,
      periodization: result !== "none" ? buildPeriodization(result) : undefined,
    });
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
        <button className={s.finishButton} onClick={completeHandler}>
          {workout?.completedAt ? "Обновить" : "Закончить"}
        </button>
      </div>
      <div className={s.stats}>
        <div className={s.stat}>
          <div className={s.statName}>Время</div>
          <div className={s.statValue}>{timer}</div>
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
        <div className={s.stat} onClick={handleSelectPeriodization}>
          <div className={s.statName}>Режим</div>
          <div
            className={clsx(s.statValue, MODE_OPTIONS[currentMode].className)}
          >
            {MODE_OPTIONS[currentMode].label}
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
    </div>
  );
}
