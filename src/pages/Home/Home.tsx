import {
  addWorkout,
  deleteWorkout,
  useQueryActiveWorkoutsByUser,
  useQueryCompletedWorkoutsByUser,
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
  type Performance,
  queryPerformancesByWorkout,
} from "../../db/performances.ts";
import {
  addSet,
  deleteSet,
  querySetsByWorkout,
  type Set,
} from "../../db/sets.ts";
import { generateFirestoreId } from "../../db/db.ts";
import { Timestamp } from "firebase/firestore";
import { clsx } from "clsx";
import { signOut, useUser } from "../../firebase/auth.ts";
import { deleteRecord, queryRecordsByWorkout } from "../../db/records.ts";

export function Home() {
  const user = useUser();
  const navigate = useNavigate();
  const workouts = useQueryCompletedWorkoutsByUser(user.uid);
  const [activeWorkout] = useQueryActiveWorkoutsByUser(user.uid);
  const [workoutActions, setWorkoutActions] = useState<Workout | null>(null);
  const activeTimer = useTimer(activeWorkout?.startedAt, undefined);

  const openWorkoutHandler = (workout: Workout | null) => {
    if (!workout) return;
    navigate(`/workouts/${workout.id}`);
  };

  const startWorkoutHandler = async () => {
    const promises: Promise<void>[] = [];

    const newWorkout: Workout = {
      id: generateFirestoreId(),
      user: user.uid,
      name: "Новая тренировка",
      startedAt: Timestamp.now(),
      completedAt: null,
      volume: 0,
      sets: 0,
    };
    promises.push(addWorkout(newWorkout));

    openWorkoutHandler(newWorkout);
    await Promise.all(promises);
  };

  const cancelWorkoutHandler = async (workout: Workout) => {
    const promises: Promise<void>[] = [];
    const performances = await queryPerformancesByWorkout(
      workout.user,
      workout.id,
    );
    const sets = await querySetsByWorkout(workout.user, workout.id);
    const records = await queryRecordsByWorkout(workout.user, workout.id);

    promises.push(deleteWorkout(workout));
    promises.push(...performances.map((p) => deletePerformance(p)));
    promises.push(...sets.map((s) => deleteSet(s)));
    promises.push(...records.map((r) => deleteRecord(r)));

    await Promise.all(promises);
  };

  const duplicateWorkoutHandler = async () => {
    if (!workoutActions) return;

    const promises: Promise<void>[] = [];
    const performances = await queryPerformancesByWorkout(
      workoutActions.user,
      workoutActions.id,
    );
    const sets = await querySetsByWorkout(
      workoutActions.user,
      workoutActions.id,
    );

    const newWorkout: Workout = {
      id: generateFirestoreId(),
      user: workoutActions.user,
      name: workoutActions.name,
      startedAt: Timestamp.now(),
      completedAt: null,
      volume: 0,
      sets: 0,
    };
    promises.push(addWorkout(newWorkout));

    for (const performance of performances) {
      const newPerformance: Performance = {
        id: generateFirestoreId(),
        user: newWorkout.user,
        workout: newWorkout.id,
        exercise: performance.exercise,
        order: performance.order,
        startedAt: newWorkout.startedAt,
      };
      promises.push(addPerformance(newPerformance));

      const performanceSets = sets.filter(
        (s) => s.performance === performance.id,
      );

      for (const set of performanceSets) {
        const newSet: Set = {
          id: generateFirestoreId(),
          user: newWorkout.user,
          workout: newWorkout.id,
          performance: newPerformance.id,
          order: set.order,
          type: set.type,
          weight: 0,
          reps: 0,
          completed: false,
        };
        promises.push(addSet(newSet));
      }
    }

    openWorkoutHandler(newWorkout);
    await Promise.all(promises);
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
            onClick={() => setWorkoutActions(workout)}
          >
            <div className={s.workoutName}>{workout.name}</div>
            <div className={s.workoutDate}>
              {DATE_FORMATTER.format(workout.startedAt?.toDate())}
            </div>
            <div className={s.workoutStats}>
              <div className={s.workoutStat}>
                <div className={s.statName}>Время</div>
                <div className={s.statValue}>
                  {buildTime(
                    workout.startedAt,
                    workout.completedAt ?? undefined,
                  )}
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
    </div>
  );
}
