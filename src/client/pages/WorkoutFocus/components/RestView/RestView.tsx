import s from "./styles.module.scss";
import { clsx } from "clsx";
import { useStore } from "../../../../components";
import { type Effort, updateSet } from "../../../../db";
import { useActiveTimer } from "../../../Workout/components";
import { EFFORTS, REST_ADJUST_SECONDS } from "../../constants.ts";
import { NextUp } from "../NextUp";
import type { RestViewProps } from "./types.ts";

// Without a next step the rest follows the last set: the person can still
// rate it, and the action finishes the workout instead of skipping rest.
export function RestView({ next, seconds, lastSet, onFinish }: RestViewProps) {
  const store = useStore();
  const { startTimer } = useActiveTimer();

  const effortHandler = (effort: Effort) => {
    if (!lastSet?.completed) return;
    updateSet(store, { ...lastSet, effort });
  };

  const finishHandler = () => {
    startTimer(undefined);
    onFinish();
  };

  const minutes = Math.floor(seconds / 60);

  return (
    <>
      <div className={s.stage}>
        <div className={s.label}>Отдых</div>
        <div className={s.time}>
          <span className={s.minutes}>{pad(minutes)}</span>
          <span>:</span>
          <span className={s.seconds}>{pad(seconds % 60)}</span>
        </div>
        <div className={s.adjust}>
          <button
            className={s.key}
            onClick={() => startTimer(seconds - REST_ADJUST_SECONDS)}
          >
            −{REST_ADJUST_SECONDS} сек
          </button>
          <button
            className={s.key}
            onClick={() => startTimer(seconds + REST_ADJUST_SECONDS)}
          >
            +{REST_ADJUST_SECONDS} сек
          </button>
        </div>
        {lastSet?.completed && (
          <>
            <div className={s.question}>Как прошёл подход?</div>
            <div className={s.keys}>
              {EFFORTS.map(({ key, label }) => (
                <button
                  key={key}
                  className={clsx(s.key, lastSet.effort === key && s.selected)}
                  onClick={() => effortHandler(key)}
                >
                  {label}
                </button>
              ))}
            </div>
          </>
        )}
        {next && <NextUp next={next} lastSet={lastSet} />}
      </div>
      <div className={s.action}>
        {next ? (
          <button className={s.skip} onClick={() => startTimer(undefined)}>
            Пропустить отдых
          </button>
        ) : (
          <button className={clsx(s.skip, s.finish)} onClick={finishHandler}>
            Завершить тренировку
          </button>
        )}
      </div>
    </>
  );
}

function pad(value: number): string {
  return value.toString().padStart(2, "0");
}
