import s from "./styles.module.scss";
import { useState } from "react";
import { MdRefresh, MdTune } from "react-icons/md";
import {
  PageModal,
  type ModalProps,
  useStore,
} from "../../../../components";
import {
  type PerformanceWeights,
  updatePerformance,
  updateSet,
} from "../../../../db";
import {
  snapWeightKg,
  stepWeightKg,
  unitsToKg,
} from "../../../../domain";
import { WeightsSelector } from "../WeightsSelector";
import { WeightsVisualizer } from "../WeightsVisualizer";
import { SheetAction, StepSheet } from "../StepSheet";
import { MANUAL_WEIGHT_STEP } from "../constants.ts";
import { UNITS_SHORT } from "../../../constants.ts";
import {
  formatWeightUnits,
  useLivePerformance,
  usePerformanceSets,
} from "../../hooks.ts";
import type { SetSheetData } from "../SetRow/types.ts";

export function WeightSheet({
  data,
  onCancel,
}: ModalProps<SetSheetData, null>) {
  const store = useStore();
  const [isInventoryOpen, setInventoryOpen] = useState(false);
  const performance = useLivePerformance(data.performance) ?? data.performance;
  const { exercise, rows, units } = usePerformanceSets(performance);
  const row = rows.find((r) => r.set.id === data.setId);

  if (!row) return null;

  const { set, recSet, number } = row;
  const weights = performance.weights;
  const equipment = exercise?.equipment ?? "none";
  const weightKg = set.weight ?? recSet?.weight;
  const isSuggested = set.weight === undefined;
  const fits =
    weights !== undefined &&
    weightKg !== undefined &&
    Math.abs(snapWeightKg(weights, weightKg) - weightKg) < 1e-3;

  const saveWeight = (newWeightKg: number | undefined) => {
    if (set.completed) return;
    updateSet(store, { ...set, weight: newWeightKg });
  };

  const stepHandler = (direction: 1 | -1) => {
    const fallback = unitsToKg(MANUAL_WEIGHT_STEP, units);
    saveWeight(stepWeightKg(weights, weightKg ?? 0, direction, fallback));
  };

  const resetHandler = () => {
    saveWeight(undefined);
    onCancel();
  };

  const inventoryHandler = (newWeights: PerformanceWeights | undefined) => {
    updatePerformance(store, { ...performance, weights: newWeights });
    setInventoryOpen(false);
  };

  const renderBody = () => {
    if (equipment === "none" || weightKg === undefined) return null;

    if (fits) {
      return (
        <div className={s.body}>
          <WeightsVisualizer
            equipment={equipment}
            weights={weights}
            weightKg={weightKg}
          />
        </div>
      );
    }

    // A number typed by the person is theirs to argue with, so nothing is
    // drawn. A number we suggested means the inventory is wrong.
    if (weights && isSuggested) {
      return (
        <div className={s.body}>
          <div className={s.warning}>
            Не собирается из того, что есть в зале
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <>
      <StepSheet
        title={`${set.type === "warm-up" ? "Разминка" : `Подход ${number}`} · вес`}
        value={formatWeightUnits(weightKg, units)}
        units={weightKg !== undefined ? UNITS_SHORT[units] : undefined}
        onDecrease={() => stepHandler(-1)}
        onIncrease={() => stepHandler(1)}
        onClose={onCancel}
        actions={
          <>
            <SheetAction onClick={resetHandler}>
              <MdRefresh />
              Сбросить
            </SheetAction>
            {equipment !== "none" && (
              <SheetAction onClick={() => setInventoryOpen(true)}>
                <MdTune />
                {!fits && weights && isSuggested
                  ? "Проверить инвентарь"
                  : "Инвентарь"}
              </SheetAction>
            )}
          </>
        }
      >
        {renderBody()}
      </StepSheet>
      <PageModal isOpen={isInventoryOpen}>
        <WeightsSelector
          equipment={equipment}
          weights={weights}
          previewKg={weightKg}
          onCancel={() => setInventoryOpen(false)}
          onSubmit={inventoryHandler}
        />
      </PageModal>
    </>
  );
}
