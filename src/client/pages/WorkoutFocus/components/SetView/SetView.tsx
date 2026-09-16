import s from "./styles.module.scss";
import { clsx } from "clsx";
import { useNavigate } from "react-router";
import { useSetAtom } from "jotai";
import { useModalStack, useStore } from "../../../../components";
import { updateSet } from "../../../../db";
import { updateRecords } from "../../../../domain";
import { useActiveTimer } from "../../../Workout/components";
import {
  formatRange,
  formatWeight,
  formatWeightChange,
  useStepPlan,
} from "../../hooks.ts";
import {
  DEFAULT_REST_SECONDS,
  DONE_LABEL,
  HINTS,
  LAST_COMPLETED_SET_ATOM,
} from "../../constants.ts";
import { ExerciseVideo } from "../ExerciseVideo";
import { WeightSheet } from "../WeightSheet";
import { RepsSheet } from "../RepsSheet";
import type { SetViewProps } from "./types.ts";

export function SetView({ step }: SetViewProps) {
  const store = useStore();
  const navigate = useNavigate();
  const { pushModal } = useModalStack();
  const { startTimer } = useActiveTimer();
  const setLastCompleted = useSetAtom(LAST_COMPLETED_SET_ATOM);
  const plan = useStepPlan(step);

  if (!plan) return null;

  const { exercise, set } = plan;
  const isWarmUp = set.type === "warm-up";
  const weight = formatWeight(plan, plan.weightKg);

  const setLine = step.isLast
    ? "Последний подход тренировки"
    : `${isWarmUp ? "Разминка" : "Подход"} ${step.number} из ${step.count}`;

  const weightHandler = () => pushModal(WeightSheet, step);

  const repsHandler = () => pushModal(RepsSheet, step);

  const doneHandler = () => {
    if (set.completed) return;

    if (plan.weightKg === undefined) {
      weightHandler();
      return;
    }

    const completed = {
      ...set,
      weight: plan.weightKg,
      reps: plan.reps,
      completed: true as const,
    };
    updateSet(store, completed);
    updateRecords(store, completed);
    setLastCompleted(completed.id);
    startTimer(step.performance.timer ?? DEFAULT_REST_SECONDS);
  };

  return (
    <>
      <div className={s.stage}>
        {exercise.asset?.type === "video" && (
          <ExerciseVideo url={exercise.asset.url} />
        )}
        <button
          className={s.name}
          onClick={() => navigate(`/exercises/${exercise.id}/history`)}
        >
          {exercise.name}
          <span className={s.chevron} />
        </button>
        <div className={clsx(s.setLine, isWarmUp && s.warmUp)}>{setLine}</div>
        <div className={s.numbers}>
          <div className={s.cell}>
            <button
              className={clsx(s.big, weight.isText && s.bigText)}
              onClick={weightHandler}
            >
              {weight.value}
              {weight.units && <span className={s.units}>{weight.units}</span>}
            </button>
            <div className={s.under}>{formatWeightChange(plan)}</div>
          </div>
          <div className={s.times}>×</div>
          <div className={s.cell}>
            <button className={s.big} onClick={repsHandler}>
              {plan.reps}
              <span className={s.units}>раз</span>
            </button>
            <div className={s.under}>
              {plan.target && `цель ${formatRange(plan.target)}`}
            </div>
          </div>
        </div>
        <div className={s.hints}>
          {HINTS.map((hint) => (
            <div key={hint}>{hint}</div>
          ))}
        </div>
      </div>
      <div className={s.action}>
        <button className={s.done} onClick={doneHandler}>
          {DONE_LABEL}
        </button>
      </div>
    </>
  );
}
