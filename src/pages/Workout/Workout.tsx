import s from "./styles.module.scss";
import { MdAdd, MdArrowBack } from "react-icons/md";
import {
  useQueryWorkoutById,
  addPerformance,
  queryPreviousPerformance,
  useQueryPerformancesByWorkout,
  generateId,
  querySetsByPerformance,
  useQuerySetsByWorkout,
  type Exercise,
  updateWorkout,
} from "../../db";
import type { PeriodizationOrNone, WorkoutParams } from "./types.ts";
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
import {
  PageModal,
  ModalDialog,
  useStore,
  BottomSheet,
} from "../../components";
import {
  addNextSet,
  duplicateSet,
  completeWorkout,
  getCurrentPeriodization,
  buildPeriodization,
} from "../../domain";
import { clsx } from "clsx";

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
  const [isPeriodizationOpen, setPeriodizationOpen] = useState(false);

  const modeOptions = {
    none: {
      label: "-",
      action: "Отключить",
      description: "Тренировка без периодизации.",
      className: s.noneMode,
    },
    light: {
      label: "Легкий",
      action: "Легкий",
      description: "Сниженная нагрузка для восстановления и техники.",
      className: s.lightMode,
    },
    medium: {
      label: "Средний",
      action: "Средний",
      description: "Умеренная нагрузка для поддержания прогресса.",
      className: s.mediumMode,
    },
    heavy: {
      label: "Тяжелый",
      action: "Тяжелый",
      description: "Максимальная нагрузка для новых рекордов.",
      className: s.hardMode,
    },
  };

  const currentMode: PeriodizationOrNone = workout?.periodization
    ? getCurrentPeriodization(workout.periodization)
    : "none";

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

  const setModeHandler = (mode: PeriodizationOrNone) => {
    if (!workout) return;
    if (mode === "none") {
      updateWorkout(store, {
        ...workout,
        periodization: undefined,
      });
    } else {
      updateWorkout(store, {
        ...workout,
        periodization: buildPeriodization(mode),
      });
    }
    setPeriodizationOpen(false);
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
        <div className={s.stat} onClick={() => setPeriodizationOpen(true)}>
          <div className={s.statName}>Режим</div>
          <div
            className={clsx(s.statValue, modeOptions[currentMode].className)}
          >
            {modeOptions[currentMode].label}
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
      <BottomSheet
        isOpen={isPeriodizationOpen}
        onClose={() => setPeriodizationOpen(false)}
      >
        <div className={s.sheetHeader}>Режим тренировки</div>
        <div className={s.sheetActions}>
          {Object.entries(modeOptions).map(([mode, option]) => (
            <button
              key={mode}
              className={clsx(s.modeAction, option.className)}
              onClick={() => setModeHandler(mode as PeriodizationOrNone)}
            >
              <span className={clsx(s.modeLabel, option.className)}>
                {option.action}
              </span>
              <span className={s.modeDescription}>{option.description}</span>
            </button>
          ))}
        </div>
      </BottomSheet>
    </div>
  );
}
