import s from "./styles.module.scss";
import { clsx } from "clsx";
import { formatWeight, useStepPlan } from "../../hooks.ts";
import type { NextUpProps } from "./types.ts";

// Leads with the numbers when the rest ends on the same exercise, and with
// the exercise name when it moves on to another one.
export function NextUp({ next, lastSet }: NextUpProps) {
  const plan = useStepPlan(next);
  if (!plan) return null;

  const weight = formatWeight(plan, plan.weightKg);
  const kind = next.set.type === "warm-up" ? "Разминка" : "Подход";
  const position = `${kind} ${next.number} из ${next.count}`;
  const numbers = `${weight.value} ${weight.units} × ${plan.reps}`;
  const isSameExercise = lastSet?.performance === next.performance.id;

  return (
    <>
      <div className={s.label}>Дальше</div>
      {isSameExercise ? (
        <>
          <div className={s.main}>{numbers}</div>
          <div className={s.sub}>{position}</div>
        </>
      ) : (
        <>
          <div className={clsx(s.main, s.name)}>{plan.exercise.name}</div>
          <div className={s.sub}>
            {position} · {numbers}
          </div>
        </>
      )}
    </>
  );
}
