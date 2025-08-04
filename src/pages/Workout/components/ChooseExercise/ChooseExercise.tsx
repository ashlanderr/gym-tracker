import type { ChooseExerciseProps } from "./types.ts";
import { useQueryAllExercises } from "../../../../db/exercises.ts";
import s from "./styles.module.scss";
import { MdAdd, MdArrowBack } from "react-icons/md";
import { MUSCLES_TRANSLATION } from "../../../constants.ts";
import { useState } from "react";
import { PageModal } from "../PageModal";
import { AddExercise } from "../AddExercise";
import { useStore } from "../../../../components";

export function ChooseExercise({ onCancel, onSubmit }: ChooseExerciseProps) {
  const store = useStore();
  const exercises = useQueryAllExercises(store);
  const [isAddExerciseOpen, setAddExerciseOpen] = useState(false);
  const [search, setSearch] = useState("");
  const searchLower = search.toLowerCase();
  const filteredExercises = exercises.filter(
    (e) =>
      e.name.toLowerCase().includes(searchLower) ||
      e.muscles.some((m) =>
        MUSCLES_TRANSLATION[m]?.toLowerCase()?.includes(searchLower),
      ),
  );

  return (
    <div className={s.root}>
      <div className={s.toolbar}>
        <button className={s.toolbarButton} onClick={onCancel}>
          <MdArrowBack />
        </button>
        <div className={s.pageTitle}>Выбрать упражнение</div>
        <button
          className={s.toolbarButton}
          onClick={() => setAddExerciseOpen(true)}
        >
          <MdAdd />
        </button>
      </div>
      <input
        className={s.search}
        value={search}
        placeholder="Поиск..."
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className={s.exercises}>
        {filteredExercises.map((exercise) => (
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
      <PageModal isOpen={isAddExerciseOpen}>
        <AddExercise
          onCancel={() => setAddExerciseOpen(false)}
          onSubmit={onSubmit}
        />
      </PageModal>
    </div>
  );
}
