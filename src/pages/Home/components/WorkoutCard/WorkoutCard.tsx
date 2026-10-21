import s from "./styles.module.scss";
import { clsx } from "clsx";
import type { ReactNode } from "react";
import { MdClose, MdPlayArrow } from "react-icons/md";
import { PiMedalFill } from "react-icons/pi";
import {
  type CompletedSet,
  queryExerciseById,
  useQueryPerformancesByWorkout,
  useQueryProgramById,
  useQuerySetsByWorkout,
  type Workout,
} from "../../../../db";
import { useStore } from "../../../../components";
import { useClock } from "../../../hooks.ts";
import { TIME_FORMATTER } from "../../constants.ts";
import { EXERCISES_SHOWN } from "./constants.ts";
import { formatDuration, summarizeExercises } from "./utils.ts";
import type {
  ActiveWorkoutCardProps,
  ExerciseSummary,
  WorkoutCardProps,
} from "./types.ts";

export function WorkoutCard({ workout, onClick }: WorkoutCardProps) {
  const { exercises, program } = useWorkoutDetails(workout);
  const time = `${TIME_FORMATTER.format(workout.startedAt)}–${TIME_FORMATTER.format(workout.completedAt!)}`;

  return (
    <div className={s.root} onClick={onClick}>
      <div className={s.kicker}>
        {program ? `${time} · ${program.name}` : time}
      </div>
      <div className={s.name}>{workout.name}</div>
      <Exercises exercises={exercises} />
      <div className={s.stats}>
        <Stat
          name="Время"
          value={formatDuration(workout.completedAt! - workout.startedAt)}
        />
        <Stat name="Объём" value={formatVolume(workout.volume)} />
        <Stat name="Подходы" value={workout.sets ?? 0} />
        {workout.records !== undefined && (
          <Stat
            name="Рекорды"
            value={
              <span className={s.records}>
                <PiMedalFill className={s.medal} />
                {workout.records}
              </span>
            }
          />
        )}
      </div>
    </div>
  );
}

// Volume and sets are kept on the workout only when it is finished, so the
// active one counts them from its sets.
export function ActiveWorkoutCard({
  workout,
  onContinue,
  onCancel,
}: ActiveWorkoutCardProps) {
  const { exercises, program, sets } = useWorkoutDetails(workout);
  const clock = useClock(workout.startedAt, null);
  const done = sets.filter((set): set is CompletedSet => set.completed);
  const volume = done.reduce((v, set) => v + set.weight * set.reps, 0);
  const since = `Идёт с ${TIME_FORMATTER.format(workout.startedAt)}`;

  return (
    <div className={clsx(s.root, s.active)}>
      <div className={clsx(s.kicker, s.live)}>
        {program ? `${since} · ${program.name}` : since}
      </div>
      <div className={s.name}>{workout.name}</div>
      <Exercises exercises={exercises} progress />
      <div className={s.stats}>
        <Stat name="Время" value={clock} />
        <Stat name="Объём" value={formatVolume(volume)} />
        <Stat
          name="Подходы"
          value={sets.length ? `${done.length} из ${sets.length}` : 0}
        />
      </div>
      <div className={s.buttons}>
        <button className={clsx(s.button, s.primary)} onClick={onContinue}>
          <MdPlayArrow />
          Продолжить
        </button>
        <button className={s.button} onClick={onCancel}>
          <MdClose />
          Отменить
        </button>
      </div>
    </div>
  );
}

function useWorkoutDetails(workout: Workout) {
  const store = useStore();
  const performances = useQueryPerformancesByWorkout(store, workout.id);
  const sets = useQuerySetsByWorkout(store, workout.id);
  const program = useQueryProgramById(store, workout.program ?? "");

  return {
    exercises: summarizeExercises(performances, sets),
    program,
    sets,
  };
}

function Exercises({
  exercises,
  progress,
}: {
  exercises: ExerciseSummary[];
  progress?: boolean;
}) {
  const store = useStore();
  const hidden = exercises.length - EXERCISES_SHOWN;
  const shown = hidden > 1 ? exercises.slice(0, EXERCISES_SHOWN) : exercises;

  if (exercises.length === 0) {
    return <div className={s.none}>Упражнений нет</div>;
  }

  return (
    <div className={s.exercises}>
      {shown.map(({ performance, exercise, done, total, best }) => (
        <div key={performance} className={s.exercise}>
          <span className={s.count}>
            {progress ? `${done}/${total}` : `${done} ×`}
          </span>
          <span className={s.exerciseName}>
            {queryExerciseById(store, exercise)?.name ?? "Упражнение"}
          </span>
          <span className={s.best}>
            {best
              ? best.weight
                ? `${best.weight} кг × ${best.reps}`
                : `× ${best.reps}`
              : "—"}
          </span>
        </div>
      ))}
      {shown.length < exercises.length && (
        <div className={s.more}>И ещё {hidden}</div>
      )}
    </div>
  );
}

function Stat({ name, value }: { name: string; value: ReactNode }) {
  return (
    <div className={s.stat}>
      <div className={s.statName}>{name}</div>
      <div className={s.statValue}>{value}</div>
    </div>
  );
}

function formatVolume(volume: number | undefined): string {
  return volume ? `${Math.round(volume).toLocaleString("ru")} кг` : "—";
}
