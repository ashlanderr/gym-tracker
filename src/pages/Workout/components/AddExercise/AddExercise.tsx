import s from "./styles.module.scss";
import { MdArrowBack, MdCheck } from "react-icons/md";
import type { AddExerciseProps } from "./types.ts";
import { useState } from "react";
import {
  addExercise,
  type Exercise,
  type MuscleType,
} from "../../../../db/exercises.ts";
import { MUSCLES_TRANSLATION } from "../../../constants.ts";
import { clsx } from "clsx";
import { generateFirestoreId } from "../../../../db/db.ts";

export function AddExercise({ onCancel, onSubmit }: AddExerciseProps) {
  const [name, setName] = useState("");
  const trimmedName = name.trim();
  const [mainMuscle, setMainMuscle] = useState<MuscleType | null>(null);
  const [secondaryMuscles, setSecondaryMuscles] = useState<MuscleType[]>([]);

  const muscles = Object.entries(MUSCLES_TRANSLATION).map(([key, label]) => ({
    key: key as MuscleType,
    label,
  }));

  const disabled =
    !trimmedName || !mainMuscle || secondaryMuscles.includes(mainMuscle);

  const mainMuscleHandler = (muscle: MuscleType) => {
    setMainMuscle(mainMuscle === muscle ? null : muscle);
  };

  const secondaryMuscleHandler = (muscle: MuscleType) => {
    if (secondaryMuscles.includes(muscle)) {
      setSecondaryMuscles(secondaryMuscles.filter((m) => m !== muscle));
    } else {
      setSecondaryMuscles([...secondaryMuscles, muscle]);
    }
  };

  const submitHandler = async () => {
    if (!trimmedName) return;
    if (!mainMuscle) return;

    const exercise: Exercise = {
      id: generateFirestoreId(),
      name: trimmedName,
      muscles: [mainMuscle, ...secondaryMuscles],
    };

    onSubmit(exercise);
    await addExercise(exercise);
  };

  return (
    <div className={s.root}>
      <div className={s.toolbar}>
        <button className={s.toolbarButton} onClick={onCancel}>
          <MdArrowBack />
        </button>
        <div className={s.pageTitle}>Создать упражнение</div>
        <button
          className={s.toolbarButton}
          disabled={disabled}
          onClick={submitHandler}
        >
          <MdCheck />
        </button>
      </div>
      <div className={s.body}>
        <label className={s.label}>Название упражнения</label>
        <input
          className={s.input}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <label className={s.label}>Основная группа мышц</label>
        <div className={s.muscles}>
          {muscles.map((muscle) => (
            <button
              className={clsx(
                s.muscle,
                mainMuscle === muscle.key && s.selected,
              )}
              key={muscle.key}
              onClick={() => mainMuscleHandler(muscle.key)}
            >
              {muscle.label}
            </button>
          ))}
        </div>
        <label className={s.label}>Другие мышцы</label>
        <div className={s.muscles}>
          {muscles.map((muscle) => (
            <button
              className={clsx(
                s.muscle,
                secondaryMuscles.includes(muscle.key) && s.selected,
              )}
              key={muscle.key}
              onClick={() => secondaryMuscleHandler(muscle.key)}
            >
              {muscle.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
