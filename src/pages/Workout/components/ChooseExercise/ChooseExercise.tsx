import type { ChooseExerciseProps } from "./types.ts";
import {
  deleteExercise,
  type Exercise,
  useQueryAllExercises,
} from "../../../../db";
import s from "./styles.module.scss";
import { MdAdd, MdArrowBack, MdDelete, MdEdit } from "react-icons/md";
import { MUSCLES_TRANSLATION } from "../../../constants.ts";
import { useState } from "react";
import {
  PageModal,
  BottomSheet,
  useStore,
  useModalStack,
} from "../../../../components";
import { AddExercise } from "../AddExercise";
import { type MouseEvent } from "react";
import { clsx } from "clsx";
import { DeleteExerciseModal } from "../DeleteExerciseModal";

export function ChooseExercise({ onCancel, onSubmit }: ChooseExerciseProps) {
  const store = useStore();
  const { pushModal } = useModalStack();
  const exercises = useQueryAllExercises(store);
  const [isAddExerciseOpen, setAddExerciseOpen] = useState(false);
  const [actionsState, setActionsState] = useState<Exercise | null>(null);
  const [editState, setEditState] = useState<Exercise | null>(null);
  const [search, setSearch] = useState("");
  const searchLower = search.toLowerCase();
  const filteredExercises = exercises.filter(
    (e) =>
      e.name.toLowerCase().includes(searchLower) ||
      e.muscles.some((m) =>
        MUSCLES_TRANSLATION[m]?.toLowerCase()?.includes(searchLower),
      ),
  );

  const onAddCancelHandler = () => {
    setAddExerciseOpen(false);
    setEditState(null);
  };

  const onAddSubmitHandler = (newExercise: Exercise) => {
    if (!editState) {
      onSubmit(newExercise);
    } else {
      setEditState(null);
    }
    setAddExerciseOpen(false);
  };

  const exerciseActionsHandler = (event: MouseEvent, exercise: Exercise) => {
    event.stopPropagation();
    event.preventDefault();
    setActionsState(exercise);
  };

  const editHandler = () => {
    if (!actionsState) return;
    setEditState(actionsState);
    setAddExerciseOpen(true);
    setActionsState(null);
  };

  const deleteHandler = async () => {
    if (!actionsState) return;
    setActionsState(null);

    const result = await pushModal(DeleteExerciseModal, null);
    if (result) {
      deleteExercise(store, actionsState);
    }
  };

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
            onContextMenu={(event) => exerciseActionsHandler(event, exercise)}
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
          exercise={editState}
          onCancel={onAddCancelHandler}
          onSubmit={onAddSubmitHandler}
        />
      </PageModal>
      {actionsState && (
        <BottomSheet isOpen={true} onClose={() => setActionsState(null)}>
          <div className={s.sheetHeader}>Упражнение</div>
          <div className={s.sheetActions}>
            <button className={s.sheetAction} onClick={editHandler}>
              <MdEdit />
              <span>Редактировать упражнение</span>
            </button>
            <button
              className={clsx(s.sheetAction, s.danger)}
              onClick={deleteHandler}
            >
              <MdDelete />
              <span>Удалить упражнение</span>
            </button>
          </div>
        </BottomSheet>
      )}
    </div>
  );
}
