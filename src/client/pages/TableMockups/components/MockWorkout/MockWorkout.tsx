import s from "./styles.module.scss";
import w from "../../../Workout/styles.module.scss";
import { clsx } from "clsx";
import { Fragment, useMemo } from "react";
import { MdAdd, MdArrowBack, MdChevronRight } from "react-icons/md";
import { useStore } from "../../../../components";
import {
  queryCurrentGym,
  queryExerciseById,
  useQueryPerformancesByWorkout,
  useQuerySetsByWorkout,
} from "../../../../db";
import {
  buildWorkoutSteps,
  findCurrentStep,
  isInventoryUnknown,
} from "../../../../domain";
import { Performance } from "../../../Workout/components";
import type { MockWorkoutProps } from "./types.ts";

// The workout page drawn from its real exercises, in one of the layouts
// under comparison. The toolbar and the stats repeat the page's own markup.
export function MockWorkout({
  workoutId,
  layout,
  hasPills,
  inventory,
}: MockWorkoutProps) {
  const store = useStore();
  const performances = useQueryPerformancesByWorkout(store, workoutId);
  const sets = useQuerySetsByWorkout(store, workoutId);
  const current = findCurrentStep(
    useMemo(() => buildWorkoutSteps(performances, sets), [performances, sets]),
  );
  const done = sets.filter((set) => set.completed);
  const volume = done.reduce((sum, set) => sum + set.weight * set.reps, 0);

  const sorted = [...performances].sort((a, b) => a.order - b.order);
  const unknown = sorted.map((performance) => {
    const exercise = queryExerciseById(store, performance.exercise);
    const gym = queryCurrentGym(store, performance.user);
    return exercise ? isInventoryUnknown(exercise, gym) : false;
  });
  const nearest = unknown.indexOf(true);

  return (
    <div className={clsx(s.root, s[layout], hasPills && s.pills)}>
      <div className={w.toolbar}>
        <span className={w.backButton}>
          <MdArrowBack />
        </span>
        <div className={w.pageTitle}>Тренировка</div>
        <span className={w.finishButton}>Закончить</span>
      </div>
      <div className={w.stats}>
        <div className={w.stat}>
          <div className={w.statName}>Время</div>
          <div className={w.statValue}>48min 12s</div>
        </div>
        <div className={w.stat}>
          <div className={w.statName}>Объём</div>
          <div className={w.statValue}>
            {Math.round(volume).toLocaleString()} кг
          </div>
        </div>
        <div className={w.stat}>
          <div className={w.statName}>Сеты</div>
          <div className={w.statValue}>
            {done.length} / {sets.length}
          </div>
        </div>
      </div>
      <div className={s.list}>
        {sorted.map((performance, index) => (
          <Fragment key={performance.id}>
            {inventory === "between" && index === nearest && (
              <div className={s.between}>
                <div className={s.betweenText}>
                  <div className={s.betweenTitle}>Веса на стеке «бабочки»</div>
                  <div className={s.betweenNote}>
                    Нужны, чтобы подобрать вес
                  </div>
                </div>
                <span className={s.betweenButton}>Указать</span>
              </div>
            )}
            <div className={s.card}>
              {inventory === "strip" && unknown[index] && (
                <div className={s.strip}>
                  <span className={s.stripText}>
                    Укажи веса на стеке, чтобы подобрать вес
                  </span>
                  <MdChevronRight />
                </div>
              )}
              <Performance
                performance={performance}
                currentSet={current?.set.id}
              />
            </div>
          </Fragment>
        ))}
        <div className={s.add}>
          <span className={w.addExerciseButton}>
            <MdAdd />
            Добавить упражнение
          </span>
        </div>
      </div>
    </div>
  );
}
