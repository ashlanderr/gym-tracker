import s from "./styles.module.scss";
import { clsx } from "clsx";
import { MdRefresh, MdTune } from "react-icons/md";
import {
  type ModalProps,
  useModalStack,
  useStore,
} from "../../../../components";
import {
  DEFAULT_EXERCISE_REPS,
  updateExercise,
  updateSet,
} from "../../../../db";
import { type RepRange } from "../../../../domain";
import { SheetAction, StepSheet } from "../StepSheet";
import { CustomRepsModal } from "../CustomRepsModal";
import { formatRepRange } from "../SetRow/utils.ts";
import { REPS_OPTIONS_COUNT } from "../constants.ts";
import { useLivePerformance, usePerformanceSets } from "../../hooks.ts";
import type { SetSheetData } from "../SetRow/types.ts";

const FALLBACK_REPS = 8;

export function RepsSheet({ data, onCancel }: ModalProps<SetSheetData, null>) {
  const store = useStore();
  const { pushModal } = useModalStack();
  const performance = useLivePerformance(data.performance) ?? data.performance;
  const { exercise, rows } = usePerformanceSets(performance);
  const row = rows.find((r) => r.set.id === data.setId);

  if (!row) return null;

  const { set, recSet, number } = row;
  const exerciseReps = exercise?.reps ?? DEFAULT_EXERCISE_REPS;
  const range: RepRange | undefined =
    recSet?.reps ??
    (typeof exerciseReps !== "string" ? exerciseReps : undefined);
  const target = set.type !== "warm-up" ? range : undefined;
  const reps = set.reps ?? recSet?.reps?.max;
  const base = reps ?? target?.min ?? FALLBACK_REPS;
  const first = Math.max(1, (target?.min ?? base) - 2);
  const options = Array.from({ length: REPS_OPTIONS_COUNT }, (_, i) => first + i);

  const saveReps = (newReps: number | undefined) => {
    if (set.completed || (newReps !== undefined && newReps < 1)) return;
    updateSet(store, { ...set, reps: newReps });
  };

  const resetHandler = () => {
    saveReps(undefined);
    onCancel();
  };

  const rangeHandler = async () => {
    if (!exercise) return;
    const current = typeof exerciseReps !== "string" ? exerciseReps : null;
    const result = await pushModal(CustomRepsModal, current);
    if (result) updateExercise(store, { ...exercise, reps: result });
  };

  return (
    <StepSheet
      title={`${set.type === "warm-up" ? "Разминка" : `Подход ${number}`} · повторы`}
      value={reps?.toString() ?? "–"}
      onDecrease={() => saveReps(base - 1)}
      onIncrease={() => saveReps(reps !== undefined ? reps + 1 : base)}
      onClose={onCancel}
      actions={
        <>
          <SheetAction onClick={resetHandler}>
            <MdRefresh />
            Сбросить
          </SheetAction>
          <SheetAction onClick={rangeHandler}>
            <MdTune />
            {range ? `Диапазон ${formatRepRange(range)}` : "Диапазон"}
          </SheetAction>
        </>
      }
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
    </StepSheet>
  );
}
