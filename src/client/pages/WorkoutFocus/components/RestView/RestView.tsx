import s from "./styles.module.scss";
import { clsx } from "clsx";
import { useStore } from "../../../../components";
import { type Effort, updateSet } from "../../../../db";
import { useActiveTimer } from "../../../Workout/components";
import { EFFORTS, REST_ADJUST_SECONDS } from "../../constants.ts";
import { formatDuration, formatWeight, useStepPlan } from "../../hooks.ts";
import type { RestViewProps } from "./types.ts";

export function RestView({ next, seconds, lastSet }: RestViewProps) {
  const store = useStore();
  const { startTimer } = useActiveTimer();
  const plan = useStepPlan(next);

  const effortHandler = (effort: Effort) => {
    if (!lastSet?.completed) return;
    updateSet(store, { ...lastSet, effort });
  };

  const weight = plan && formatWeight(plan, plan.weightKg);
  const nextKind = next.set.type === "warm-up" ? "разминка" : "подход";

  return (
    <>
      <div className={s.stage}>
        <div className={s.label}>Отдых</div>
        <div className={s.time}>{formatDuration(seconds)}</div>
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
        {plan && weight && (
          <>
            <div className={s.label}>Дальше</div>
            <div className={s.next}>
              {weight.value} {weight.units} × {plan.reps}
            </div>
            <div className={s.nextName}>
              {plan.exercise.name}, {nextKind} {next.number} из {next.count}
            </div>
          </>
        )}
      </div>
      <div className={s.action}>
        <button className={s.skip} onClick={() => startTimer(undefined)}>
          Пропустить отдых
        </button>
      </div>
    </>
  );
}
