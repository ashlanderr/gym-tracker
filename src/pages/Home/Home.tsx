import {
  addWorkout,
  deleteWorkout,
  useQueryActiveWorkouts,
  useQueryCompletedWorkouts,
  type Workout,
} from "../../db/workouts.ts";
import { buildTime, useTimer } from "../hooks.ts";
import s from "./styles.module.scss";
import { APP_VERSION, DATE_FORMATTER } from "./constants.ts";
import {
  MdAdd,
  MdClose,
  MdDelete,
  MdEdit,
  MdLogout,
  MdPerson,
  MdPlayArrow,
} from "react-icons/md";
import { useNavigate } from "react-router";
import { useState } from "react";
import { BottomSheet } from "../Workout/components/BottomSheet";
import {
  addPerformance,
  deletePerformance,
  queryPerformancesByWorkout,
} from "../../db/performances.ts";
import { addSet, deleteSet, querySetsByWorkout } from "../../db/sets.ts";
import { generateId } from "../../db/db.ts";
import { clsx } from "clsx";
import { signOut, useUser } from "../../firebase/auth.ts";
import { deleteRecord, queryRecordsByWorkout } from "../../db/records.ts";
import { useStore } from "../../components";
import { ModalDialog } from "../Workout/components/ModalDialog";

export function Home() {
  const user = useUser();
  const store = useStore();
  const navigate = useNavigate();
  const workouts = useQueryCompletedWorkouts(store);
  const [activeWorkout] = useQueryActiveWorkouts(store);
  const [workoutActions, setWorkoutActions] = useState<Workout | null>(null);
  const activeTimer = useTimer(activeWorkout?.startedAt ?? null, null);
  const [cancelWorkout, setCancelWorkout] = useState<Workout | null>(null);

  const openWorkoutHandler = (workout: Workout | null) => {
    if (!workout) return;
    navigate(`/workouts/${workout.id}`);
  };

  const startWorkoutHandler = () => {
    const newWorkout = addWorkout(store, {
      id: generateId(),
      user: user.uid,
      name: "Новая тренировка",
      startedAt: Date.now(),
      completedAt: null,
      volume: 0,
      sets: 0,
    });
    openWorkoutHandler(newWorkout);
  };

  const cancelWorkoutBeginHandler = (workout: Workout) => {
    setCancelWorkout(workout);
  };

  const cancelWorkoutCompleteHandler = () => {
    if (!cancelWorkout) return;

    const performances = queryPerformancesByWorkout(store, cancelWorkout.id);
    const sets = querySetsByWorkout(store, cancelWorkout.id);
    const records = queryRecordsByWorkout(store, cancelWorkout.id);

    records.map((r) => deleteRecord(store, r));
    sets.forEach((s) => deleteSet(store, s));
    performances.forEach((p) => deletePerformance(store, p));
    deleteWorkout(store, cancelWorkout);

    setCancelWorkout(null);
  };

  const duplicateWorkoutHandler = () => {
    if (!workoutActions) return;

    const performances = queryPerformancesByWorkout(store, workoutActions.id);
    const sets = querySetsByWorkout(store, workoutActions.id);

    const newWorkout = addWorkout(store, {
      id: generateId(),
      user: workoutActions.user,
      name: workoutActions.name,
      startedAt: Date.now(),
      completedAt: null,
      volume: 0,
      sets: 0,
    });

    for (const performance of performances) {
      const newPerformance = addPerformance(store, {
        id: generateId(),
        user: newWorkout.user,
        workout: newWorkout.id,
        exercise: performance.exercise,
        order: performance.order,
        startedAt: newWorkout.startedAt,
      });

      const performanceSets = sets.filter(
        (s) => s.performance === performance.id,
      );

      for (const set of performanceSets) {
        addSet(store, {
          id: generateId(),
          user: newWorkout.user,
          workout: newWorkout.id,
          exercise: newPerformance.exercise,
          performance: newPerformance.id,
          order: set.order,
          type: set.type,
          weight: 0,
          reps: 0,
          completed: false,
        });
      }
    }

    openWorkoutHandler(newWorkout);
  };

  const deleteWorkoutHandler = () => {
    // todo
    alert("TBD");
  };

  return (
    <div className={s.body}>
      <div className={s.user}>
        {user.photoURL ? (
          <img className={s.userImage} src={user.photoURL} alt="User Photo" />
        ) : (
          <div className={s.userImage}>
            <MdPerson />
          </div>
        )}
        <div className={s.userInfo}>
          <div className={s.userName}>
            {user.displayName ?? "Анонимный Пользователь"}
          </div>
          <button className={s.signOut} onClick={signOut}>
            <MdLogout />
            <span>Выйти</span>
          </button>
        </div>
      </div>
      <div className={s.workouts}>
        {activeWorkout ? (
          <div className={s.workout}>
            <div className={s.workoutName}>Активная тренировка</div>
            <div className={s.workoutTimer}>{activeTimer}</div>
            <div className={s.workoutButtons}>
              <button
                className={clsx(s.workoutButton, s.startWorkout)}
                onClick={() => openWorkoutHandler(activeWorkout)}
              >
                <MdPlayArrow />
                Продолжить
              </button>
              <button
                className={clsx(s.workoutButton, s.cancelWorkout)}
                onClick={() => cancelWorkoutBeginHandler(activeWorkout)}
              >
                <MdClose />
                Отменить
              </button>
            </div>
          </div>
        ) : (
          <div className={s.workout}>
            <div className={s.workoutName}>Новая тренировка</div>
            <div className={s.workoutButtons}>
              <button
                className={clsx(s.workoutButton, s.startWorkout)}
                onClick={() => startWorkoutHandler()}
              >
                <MdAdd />
                Начать тренировку
              </button>
            </div>
          </div>
        )}
        {workouts.map((workout) => (
          <div
            key={workout.id}
            className={s.workout}
            onClick={() => setWorkoutActions(workout)}
          >
            <div className={s.workoutName}>{workout.name}</div>
            <div className={s.workoutDate}>
              {DATE_FORMATTER.format(workout.startedAt)}
            </div>
            <div className={s.workoutStats}>
              <div className={s.workoutStat}>
                <div className={s.statName}>Время</div>
                <div className={s.statValue}>
                  {buildTime(workout.startedAt, workout.completedAt)}
                </div>
              </div>
              <div className={s.workoutStat}>
                <div className={s.statName}>Объём</div>
                <div className={s.statValue}>
                  {workout.volume?.toLocaleString() ?? "-"} кг
                </div>
              </div>
              <div className={s.workoutStat}>
                <div className={s.statName}>Сеты</div>
                <div className={s.statValue}>{workout.sets}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className={s.appVersion}>App Version: {APP_VERSION}</div>
      <BottomSheet
        isOpen={workoutActions !== null}
        onClose={() => setWorkoutActions(null)}
      >
        <div className={s.sheetHeader}>Тренировка</div>
        <div className={s.sheetActions}>
          <button
            className={s.sheetAction}
            onClick={() => openWorkoutHandler(workoutActions)}
          >
            <MdEdit />
            <span>Открыть тренировку</span>
          </button>
          <button
            className={s.sheetAction}
            disabled={!!activeWorkout}
            onClick={duplicateWorkoutHandler}
          >
            <MdPlayArrow />
            <span>Повторить тренировку</span>
          </button>
          <button className={s.sheetAction} onClick={deleteWorkoutHandler}>
            <MdDelete />
            <span>Удалить тренировку</span>
          </button>
        </div>
      </BottomSheet>
      {cancelWorkout && (
        <ModalDialog
          title={"Подтверждение"}
          isOpen={true}
          cancelText="НЕТ"
          submitText="ДА"
          submitColor="#a00"
          onClose={() => setCancelWorkout(null)}
          onSubmit={cancelWorkoutCompleteHandler}
        >
          Вы уверены, что хотите отменить тренировку?
        </ModalDialog>
      )}
    </div>
  );
}
