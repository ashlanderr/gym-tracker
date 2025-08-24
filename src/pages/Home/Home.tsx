import {
  type PeriodizationMode,
  useQueryActiveWorkouts,
  useQueryCompletedWorkouts,
  type Workout,
} from "../../db";
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
  MdSettings,
} from "react-icons/md";
import { useNavigate } from "react-router";
import { type ReactNode, useState } from "react";
import { clsx } from "clsx";
import { signOut, useUser } from "../../firebase/auth.ts";
import {
  BottomSheet,
  ModalDialog,
  useStore,
  useConnectionStatus,
} from "../../components";
import { PiMedalFill } from "react-icons/pi";
import {
  addWorkout,
  cancelWorkout,
  duplicateWorkout,
  getCurrentPeriodization,
} from "../../domain";

export function Home() {
  const user = useUser();
  const store = useStore();
  const connection = useConnectionStatus();
  const navigate = useNavigate();
  const workouts = useQueryCompletedWorkouts(store);
  const [activeWorkout] = useQueryActiveWorkouts(store);
  const [workoutActions, setWorkoutActions] = useState<Workout | null>(null);
  const activeTimer = useTimer(activeWorkout?.startedAt ?? null, null);
  const [cancellingWorkout, setCancellingWorkout] = useState<Workout | null>(
    null,
  );

  const modeLabels: Record<PeriodizationMode, ReactNode> = {
    light: <span className={s.lightMode} />,
    medium: <span className={s.mediumMode} />,
    heavy: <span className={s.hardMode} />,
  };

  const openWorkoutHandler = (workout: Workout | null) => {
    if (!workout) return;
    navigate(`/workouts/${workout.id}`);
  };

  const startWorkoutHandler = () => {
    const newWorkout = addWorkout(store, user.uid);
    openWorkoutHandler(newWorkout);
  };

  const cancelWorkoutBeginHandler = (workout: Workout) => {
    setCancellingWorkout(workout);
  };

  const cancelWorkoutCompleteHandler = () => {
    if (!cancellingWorkout) return;
    cancelWorkout(store, cancellingWorkout);
    setCancellingWorkout(null);
  };

  const duplicateWorkoutHandler = () => {
    if (!workoutActions) return;
    const newWorkout = duplicateWorkout(store, workoutActions);
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
        <button className={s.userSettings} onClick={() => navigate("/user")}>
          <MdSettings />
        </button>
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
            {workout.periodization &&
              modeLabels[getCurrentPeriodization(workout.periodization)]}
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
                  {workout.volume
                    ? Math.round(workout.volume).toLocaleString()
                    : "-"}{" "}
                  кг
                </div>
              </div>
              <div className={s.workoutStat}>
                <div className={s.statName}>Сеты</div>
                <div className={s.statValue}>{workout.sets}</div>
              </div>
              {workout.records !== undefined && (
                <div className={s.workoutStat}>
                  <div className={s.statName}>Рекорды</div>
                  <div className={clsx(s.statValue, s.statRecords)}>
                    <PiMedalFill className={s.recordMedal} />
                    {workout.records}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className={s.appVersion}>App Version: {APP_VERSION}</div>
      <div className={s.connectionStatus}>Network: {connection}</div>
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
      {cancellingWorkout && (
        <ModalDialog
          title={"Подтверждение"}
          isOpen={true}
          cancelText="НЕТ"
          submitText="ДА"
          submitColor="#a00"
          onClose={() => setCancellingWorkout(null)}
          onSubmit={cancelWorkoutCompleteHandler}
        >
          Вы уверены, что хотите отменить тренировку?
        </ModalDialog>
      )}
    </div>
  );
}
