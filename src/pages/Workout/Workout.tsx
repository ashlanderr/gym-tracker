import s from "./styles.module.scss";
import { MdAdd } from "react-icons/md";
import { clsx } from "clsx";
import { useQueryWorkoutById } from "../../db/workouts.ts";
import type { WorkoutParams } from "./types.ts";
import { usePageParams } from "../hooks.ts";
import {
  addPerformance,
  useQueryPerformancesByWorkout,
} from "../../db/performances.ts";
import { Performance } from "./components";
import { useState } from "react";
import { PageModal } from "./components/PageModal";
import { ChooseExercise } from "./components/ChooseExercise";
import type { Exercise } from "../../db/exercises.ts";
import { addSet } from "../../db/sets.ts";
import { generateFirestoreId } from "../../db/db.ts";

export function Workout() {
  const { workoutId } = usePageParams<WorkoutParams>();
  const workout = useQueryWorkoutById(workoutId);
  const performances = useQueryPerformancesByWorkout(workoutId);
  const [isAddPerformanceOpen, setAddPerformanceOpen] = useState(false);

  const addPerformanceHandler = async (exercise: Exercise) => {
    if (!workout) return;

    setAddPerformanceOpen(false);

    const performanceId = generateFirestoreId();
    const performancePromise = addPerformance({
      id: performanceId,
      user: workout.user,
      workout: workout.id,
      exercise: exercise.id,
      order: Math.max(-1, ...performances.map((p) => p.order)) + 1,
      startedAt: workout.startedAt,
    });

    const setPromise = addSet({
      id: generateFirestoreId(),
      performance: performanceId,
      order: 0,
      type: "working",
      weight: 0,
      reps: 0,
      completed: false,
    });

    await Promise.all([performancePromise, setPromise]);
  };

  return (
    <div className={s.root}>
      <div className={s.toolbar}>
        <div className={s.pageTitle}>Тренировка</div>
        <button className={s.finishButton}>Закончить</button>
      </div>
      <div className={s.stats}>
        <div className={s.stat}>
          <div className={s.statName}>Время</div>
          <div className={clsx(s.statValue, s.accent)}>10s</div>
        </div>
        <div className={s.stat}>
          <div className={s.statName}>Объём</div>
          <div className={s.statValue}>0 кг</div>
        </div>
        <div className={s.stat}>
          <div className={s.statName}>Сеты</div>
          <div className={s.statValue}>0</div>
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
