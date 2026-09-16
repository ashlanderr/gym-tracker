import s from "./styles.module.scss";
import { clsx } from "clsx";
import { type ModalProps, useStore } from "../../../../components";
import { updateSet } from "../../../../db";
import type { WorkoutStep } from "../../../../domain";
import { formatRange, useStepPlan } from "../../hooks.ts";
import { StepSheet } from "../StepSheet";

const OPTIONS_COUNT = 6;

export function RepsSheet({
  data: step,
  onCancel,
}: ModalProps<WorkoutStep, null>) {
  const store = useStore();
  const plan = useStepPlan(step);

  if (!plan) return null;

  const { set, reps, target } = plan;
  const first = Math.max(1, (target?.min ?? reps) - 2);
  const options = Array.from({ length: OPTIONS_COUNT }, (_, i) => first + i);

  const saveReps = (newReps: number) => {
    if (set.completed || newReps < 1) return;
    updateSet(store, { ...set, reps: newReps });
  };

  return (
    <StepSheet
      title="Повторы"
      value={reps.toString()}
      onDecrease={() => saveReps(reps - 1)}
      onIncrease={() => saveReps(reps + 1)}
      onClose={onCancel}
    >
      <div className={s.quick}>
        {options.map((option) => (
          <button
            key={option}
            className={clsx(
              s.option,
              target &&
                option >= target.min &&
                option <= target.max &&
                s.target,
              option === reps && s.selected,
            )}
            onClick={() => saveReps(option)}
          >
            {option}
          </button>
        ))}
      </div>
      {target && (
        <div className={s.subnote}>цель {formatRange(target)} повторов</div>
      )}
    </StepSheet>
  );
}
