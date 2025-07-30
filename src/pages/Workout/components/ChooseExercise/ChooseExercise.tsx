import type { ChooseExerciseProps } from "./types.ts";
import { useQueryAllExercises } from "../../../../db/exercises.ts";
import s from "./styles.module.scss";
import { MdAdd, MdArrowBack } from "react-icons/md";
import { MUSCLES_TRANSLATION } from "./constants.ts";

export function ChooseExercise({ onCancel, onSubmit }: ChooseExerciseProps) {
  const exercises = useQueryAllExercises();

  return (
    <div className={s.root}>
      <div className={s.toolbar}>
        <button className={s.toolbarButton} onClick={onCancel}>
          <MdArrowBack />
        </button>
        <div className={s.pageTitle}>Выбрать упражнение</div>
        <button className={s.toolbarButton}>
          <MdAdd />
        </button>
      </div>
      <div className={s.exercises}>
        {exercises.map((exercise) => (
          <div
            key={exercise.id}
            className={s.exercise}
            onClick={() => onSubmit(exercise)}
          >
            <div className={s.exerciseName}> {exercise.name}</div>
            <div className={s.muscles}>
              {exercise.muscles.map((m) => (
                <div key={m} className={s.muscle}>
                  {MUSCLES_TRANSLATION[m] ?? m}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
