import s from "./styles.module.scss";
import { MdAdd } from "react-icons/md";
import { clsx } from "clsx";
import { useQueryWorkoutById } from "../../db/workouts.ts";
import type { WorkoutParams } from "./types.ts";
import { usePageParams } from "../hooks.ts";
import { useQueryPerformancesByWorkout } from "../../db/performances.ts";
import { Performance } from "./components";

export function Workout() {
  const { workoutId } = usePageParams<WorkoutParams>();
  const workout = useQueryWorkoutById(workoutId);
  const performances = useQueryPerformancesByWorkout(workoutId);

  console.log(workout, performances);

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
        <button className={s.addExerciseButton}>
          <MdAdd />
          Добавить упражнение
        </button>
      </div>
    </div>
  );
}
