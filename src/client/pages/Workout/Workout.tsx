import s from "./styles.module.scss";
import { MdAdd, MdArrowBack } from "react-icons/md";
import {
  useQueryWorkoutById,
  useQueryPerformancesByWorkout,
  useQuerySetsByWorkout,
  useQueryExerciseById,
  type Exercise,
} from "../../db";
import type { WorkoutParams } from "./types.ts";
import { usePageParams } from "../hooks.ts";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useTimer } from "../hooks.ts";
import {
  Performance,
  ChooseExercise,
  CompleteWorkoutModal,
} from "./components";
import {
  PageModal,
  useStore,
  useModalStack,
  useScrollRestoration,
} from "../../components";
import {
  completeWorkout,
  addPerformance,
  buildWorkoutSteps,
  findCurrentStep,
} from "../../domain";

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
  const { scrollRef } = useScrollRestoration();
  const steps = useMemo(
    () => buildWorkoutSteps(performances, sets),
    [performances, sets],
  );
  const current = workout?.completedAt ? undefined : findCurrentStep(steps);
  const currentExercise = useQueryExerciseById(
    store,
    current?.performance.exercise ?? "",
  );

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

  return (
    <div className={s.root} ref={scrollRef}>
      <div className={s.toolbar}>
        <button className={s.backButton} onClick={() => navigate(-1)}>
          <MdArrowBack />
        </button>
        <div className={s.pageTitle}>Вся тренировка</div>
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
      </div>
      <div className={s.exercises}>
        {performances.map((performance) => (
          <Performance
            key={performance.id}
            performance={performance}
            currentSet={current?.set.id}
          />
        ))}
        <button
          className={s.addExerciseButton}
          onClick={() => setAddPerformanceOpen(true)}
        >
          <MdAdd />
          Добавить упражнение
        </button>
      </div>
      {current && currentExercise && (
        <button className={s.backToSet} onClick={() => navigate(-1)}>
          <MdArrowBack />
          <span className={s.backToSetText}>
            Вернуться к подходу · {currentExercise.name}
          </span>
          <span className={s.backToSetPosition}>
            {current.number} из {current.count}
          </span>
        </button>
      )}
      <PageModal isOpen={isAddPerformanceOpen}>
        <ChooseExercise
          onCancel={() => setAddPerformanceOpen(false)}
          onSubmit={addPerformanceHandler}
        />
      </PageModal>
    </div>
  );
}
