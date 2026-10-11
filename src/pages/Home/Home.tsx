import {
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
  MdLogout,
  MdPerson,
  MdPlayArrow,
  MdSettings,
} from "react-icons/md";
import { useNavigate } from "react-router";
import { clsx } from "clsx";
import { signOut, useUser } from "../../firebase/auth.ts";
import {
  useConnectionStatus,
  useModalStack,
  useScrollRestoration,
  useStore,
} from "../../components";
import { PiMedalFill } from "react-icons/pi";
import { addWorkout, cancelWorkout, duplicateWorkout } from "../../domain";
import { CancelWorkoutModal, WorkoutActionsSheet } from "./components";
import { formatSoundLog } from "../../utils";

export function Home() {
  const user = useUser();
  const store = useStore();
  const connection = useConnectionStatus();
  const navigate = useNavigate();
  const { pushModal } = useModalStack();
  const workouts = useQueryCompletedWorkouts(store);
  const [activeWorkout] = useQueryActiveWorkouts(store);
  const activeTimer = useTimer(activeWorkout?.startedAt ?? null, null);
  const { scrollRef } = useScrollRestoration();

  const openWorkoutHandler = (workout: Workout | null) => {
    if (!workout) return;
    navigate(`/workouts/${workout.id}`);
  };

  const startWorkoutHandler = () => {
    const newWorkout = addWorkout(store, user.uid);
    openWorkoutHandler(newWorkout);
  };

  const cancelWorkoutHandler = async (workout: Workout) => {
    const confirm = await pushModal(CancelWorkoutModal, null);
    if (confirm) {
      cancelWorkout(store, workout);
    }
  };

  const workoutActionsHandler = async (workout: Workout) => {
    const action = await pushModal(WorkoutActionsSheet, {
      workout,
      canDuplicate: !activeWorkout,
    });

    if (action === "open") {
      openWorkoutHandler(workout);
    } else if (action === "duplicate") {
      openWorkoutHandler(duplicateWorkout(store, workout));
    } else if (action === "delete") {
      const confirm = await pushModal(CancelWorkoutModal, null);
      if (confirm) cancelWorkout(store, workout);
    }
  };

  const copySoundLogHandler = async () => {
    try {
      await navigator.clipboard.writeText(formatSoundLog());
      alert("Лог звука таймера скопирован");
    } catch (e) {
      alert(`Не удалось скопировать лог: ${e}`);
    }
  };

  return (
    <div className={s.body} ref={scrollRef}>
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
                onClick={() => cancelWorkoutHandler(activeWorkout)}
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
            onClick={() => workoutActionsHandler(workout)}
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
      <div className={s.appVersion} onClick={copySoundLogHandler}>
        App Version: {APP_VERSION}
      </div>
      <div className={s.connectionStatus}>Network: {connection}</div>
    </div>
  );
}
