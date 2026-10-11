import type { ChooseExerciseProps } from "./types.ts";
import {
  deleteExercise,
  type Exercise,
  useQueryAllExercises,
} from "../../../../db";
import s from "./styles.module.scss";
import { MdAdd } from "react-icons/md";
import { MUSCLES_TRANSLATION } from "../../../constants.ts";
import { type MouseEvent, useState } from "react";
import {
  HeaderButton,
  MuscleFigure,
  PageHeader,
  useStore,
  useModalStack,
} from "../../../../components";
import { AddExercise } from "../AddExercise";
import { DeleteExerciseModal } from "../DeleteExerciseModal";
import { ExerciseActionsSheet } from "../ExerciseActionsSheet";

export function ChooseExercise({ onCancel, onSubmit }: ChooseExerciseProps) {
  const store = useStore();
  const { pushModal } = useModalStack();
  const exercises = useQueryAllExercises(store);
  const [search, setSearch] = useState("");
  const searchLower = search.toLowerCase();
  const filteredExercises = exercises.filter(
    (e) =>
      e.name.toLowerCase().includes(searchLower) ||
      e.muscles.some((m) =>
        MUSCLES_TRANSLATION[m]?.toLowerCase()?.includes(searchLower),
      ),
  );

  const addHandler = async () => {
    const newExercise = await pushModal(AddExercise, null);
    if (newExercise) {
      onSubmit(newExercise);
    }
  };

  const exerciseActionsHandler = async (
    event: MouseEvent,
    exercise: Exercise,
  ) => {
    event.stopPropagation();
    event.preventDefault();

    const action = await pushModal(ExerciseActionsSheet, exercise);
    if (action === "edit") {
      await pushModal(AddExercise, exercise);
    } else if (action === "delete") {
      const confirmed = await pushModal(DeleteExerciseModal, null);
      if (confirmed) deleteExercise(store, exercise);
    }
  };

  return (
    <div className={s.root}>
      <PageHeader
        title="Выбрать упражнение"
        onBack={onCancel}
        right={
          <HeaderButton onClick={addHandler}>
            <MdAdd />
          </HeaderButton>
        }
      >
        <input
          className={s.search}
          value={search}
          placeholder="Поиск..."
          onChange={(e) => setSearch(e.target.value)}
        />
      </PageHeader>
      <div className={s.exercises}>
        {filteredExercises.map((exercise) => (
          <div
            key={exercise.id}
            className={s.exercise}
            onClick={() => onSubmit(exercise)}
            onContextMenu={(event) => exerciseActionsHandler(event, exercise)}
          >
            <div className={s.picture}>
              <MuscleFigure muscles={exercise.muscles} />
            </div>
            <div className={s.info}>
              <div className={s.exerciseName}>{exercise.name}</div>
              <div className={s.muscles}>
                {exercise.muscles.map((m) => (
                  <div key={m} className={s.muscle}>
                    {MUSCLES_TRANSLATION[m] ?? m}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
