import s from "./styles.module.scss";
import { clsx } from "clsx";
import { MdClose, MdPlayArrow } from "react-icons/md";
import { PiMedalFill } from "react-icons/pi";
import { buildTime, useTimer } from "../../../hooks.ts";
import { TIME_FORMATTER } from "../../constants.ts";
import type { ActiveWorkoutCardProps, WorkoutCardProps } from "./types.ts";

export function WorkoutCard({ workout, onClick }: WorkoutCardProps) {
  return (
    <div className={s.root} onClick={onClick}>
      <div className={s.name}>{workout.name}</div>
      <div className={s.time}>
        {TIME_FORMATTER.format(workout.startedAt)} ·{" "}
        {buildTime(workout.startedAt, workout.completedAt)}
      </div>
      <div className={s.stats}>
        <div className={s.stat}>
          <div className={s.statName}>Объём</div>
          <div className={s.statValue}>
            {workout.volume ? Math.round(workout.volume).toLocaleString() : "-"}{" "}
            кг
          </div>
        </div>
        <div className={s.stat}>
          <div className={s.statName}>Сеты</div>
          <div className={s.statValue}>{workout.sets}</div>
        </div>
        {workout.records !== undefined && (
          <div className={s.stat}>
            <div className={s.statName}>Рекорды</div>
            <div className={clsx(s.statValue, s.records)}>
              <PiMedalFill className={s.medal} />
              {workout.records}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function ActiveWorkoutCard({
  workout,
  onContinue,
  onCancel,
}: ActiveWorkoutCardProps) {
  const timer = useTimer(workout.startedAt, null);

  return (
    <div className={s.root}>
      <div className={s.name}>Активная тренировка</div>
      <div className={s.time}>
        {TIME_FORMATTER.format(workout.startedAt)} · {timer}
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
