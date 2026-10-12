import s from "./styles.module.scss";
import { useState } from "react";
import type { ModalProps } from "../../../../components";
import {
  MANUAL_WEIGHT_STEP,
  stepWeightKg,
  unitsToKg,
} from "../../../../domain";
import { SheetAction, StepSheet } from "../../../Workout/components/StepSheet";
import { WeightsVisualizer } from "../../../Workout/components/WeightsVisualizer";
import { UNITS_SHORT } from "../../../constants.ts";
import {
  formatWeightUnits,
  usePerformanceSets,
} from "../../../Workout/hooks.ts";
import type { StartWeightSheetData } from "./types.ts";

// The weight is picked here and written only on the answer, so stepping
// through it does not close the question behind the sheet.
export function StartWeightSheet({
  data,
  onCancel,
  onSubmit,
}: ModalProps<StartWeightSheetData, number>) {
  const { performance } = data;
  const { exercise, units } = usePerformanceSets(performance);
  const [weightKg, setWeightKg] = useState(data.initialKg);
  const weights = performance.weights;
  const equipment = exercise?.equipment ?? "none";

  const stepHandler = (direction: 1 | -1) => {
    const fallback = unitsToKg(MANUAL_WEIGHT_STEP, units);
    setWeightKg(stepWeightKg(weights, weightKg, direction, fallback));
  };

  return (
    <StepSheet
      title="Вес на сегодня"
      value={formatWeightUnits(weightKg, units)}
      units={UNITS_SHORT[units]}
      onDecrease={() => stepHandler(-1)}
      onIncrease={() => stepHandler(1)}
      onClose={onCancel}
      actions={
        <SheetAction isPrimary onClick={() => onSubmit(weightKg)}>
          Выбрать
        </SheetAction>
      }
    >
      {weights && equipment !== "none" && (
        <div className={s.body}>
          <WeightsVisualizer
            equipment={equipment}
            weights={weights}
            weightKg={weightKg}
          />
        </div>
      )}
    </StepSheet>
  );
}
