import s from "./styles.module.scss";
import { clsx } from "clsx";
import { useNavigate } from "react-router";
import { useSetAtom } from "jotai";
import { useModalStack, useStore } from "../../../../components";
import { updateSet } from "../../../../db";
import { updateRecords, warmUpAfterWeightChange } from "../../../../domain";
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
  FINDING_REASONS,
  HINTS,
  LAST_COMPLETED_SET_ATOM,
} from "../../constants.ts";
import { ExerciseAnimation } from "../ExerciseAnimation";
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

  const position = `${step.number} из ${step.count}`;
  const setLine = step.isLast
    ? "Последний подход тренировки"
    : isWarmUp
      ? `Разминка ${position}`
      : plan.isFinding
        ? `Подбор веса · подход ${position}`
        : `Подход ${position}`;

  const working =
    plan.workingWeightKg !== undefined
      ? formatWeight(plan, plan.workingWeightKg)
      : null;
  const underWeight = working
    ? `перед ${working.value} ${working.units}`
    : formatWeightChange(plan);

  // The sheet writes the weight on every press, so a warm-up the new weight
  // brings can only be inserted once it is closed.
  const weightHandler = async () => {
    await pushModal(WeightSheet, step);
    warmUpAfterWeightChange(store, step.performance);
  };

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

    // No rest between warm-up sets: the first one comes before the first
    // working set.
    if (isWarmUp && step.number < step.count) return;

    // The current set is the first unfinished one, so the last step ends the
    // workout. A configured timer still runs, because the last set is rated
    // on the rest screen too; without one there is nothing to wait for.
    const timer = step.isLast
      ? step.performance.timer
      : (step.performance.timer ?? DEFAULT_REST_SECONDS);

    if (timer) {
      startTimer(timer);
    } else {
      navigate(`/workouts/${step.performance.workout}/finish`);
    }
  };

  return (
    <>
      <div className={s.stage}>
        {exercise.asset?.type === "cross-fade" && (
          <ExerciseAnimation
            startUrl={exercise.asset.startUrl}
            endUrl={exercise.asset.endUrl}
          />
        )}
        <button
          className={s.name}
          onClick={() =>
            navigate(
              `/exercises/${exercise.id}?performance=${step.performance.id}`,
            )
          }
        >
          {exercise.name}
          <span className={s.chevron} />
        </button>
        <div
          className={clsx(
            s.setLine,
            isWarmUp && s.warmUp,
            plan.isFinding && !isWarmUp && s.finding,
          )}
        >
          {setLine}
        </div>
        <div className={s.numbers}>
          <div className={s.cell}>
            <button
              className={clsx(s.big, weight.isEmpty && s.empty)}
              onClick={weightHandler}
            >
              {weight.value}
              {weight.units && <span className={s.units}>{weight.units}</span>}
            </button>
            <div className={s.under}>{underWeight}</div>
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
        <div className={s.reason}>
          {plan.reason && FINDING_REASONS[plan.reason]}
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
