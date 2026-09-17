import s from "./styles.module.scss";
import { useState } from "react";
import {
  PageModal,
  type ModalProps,
  useModalStack,
  useStore,
} from "../../../../components";
import { type Gym, updateGym, updateSet } from "../../../../db";
import {
  computeWeights,
  stepWeightKg,
  unitsToKg,
  type WorkoutStep,
} from "../../../../domain";
import {
  describeWeights,
  WeightsSelector,
  WeightsVisualizer,
} from "../../../Workout/components";
import { formatWeight, useStepPlan } from "../../hooks.ts";
import { MANUAL_WEIGHT_STEP } from "../../constants.ts";
import { StepSheet } from "../StepSheet";
import { ManualWeightModal } from "../ManualWeightModal";

export function WeightSheet({
  data: step,
  onCancel,
}: ModalProps<WorkoutStep, null>) {
  const store = useStore();
  const { pushModal } = useModalStack();
  const [isInventoryOpen, setInventoryOpen] = useState(false);
  const plan = useStepPlan(step);

  if (!plan) return null;

  const { exercise, gym, set, weightKg, units } = plan;
  const ctor =
    weightKg !== undefined ? computeWeights(exercise, gym, weightKg) : null;
  const fits =
    ctor !== null &&
    weightKg !== undefined &&
    Math.abs(ctor.totalKg - weightKg) < 1e-3;
  const weight = formatWeight(plan, weightKg);

  const saveWeight = (newWeightKg: number) => {
    if (set.completed) return;
    updateSet(store, { ...set, weight: newWeightKg });
  };

  const stepHandler = (direction: 1 | -1) => {
    const fallback = unitsToKg(MANUAL_WEIGHT_STEP, units);
    saveWeight(stepWeightKg(exercise, gym, weightKg ?? 0, direction, fallback));
  };

  const manualHandler = async () => {
    const result = await pushModal(ManualWeightModal, { units, weightKg });
    if (result !== undefined) saveWeight(result);
  };

  const inventoryHandler = (newGym: Gym) => {
    updateGym(store, newGym);
    setInventoryOpen(false);
  };

  const renderBody = () => {
    if (fits) {
      return (
        <>
          <div className={s.body}>
            <WeightsVisualizer
              exercise={exercise}
              gym={gym}
              weightKg={weightKg}
            />
          </div>
          <div className={s.subnote}>{describeWeights(ctor)}</div>
        </>
      );
    }

    // A number typed by the person is theirs to argue with, so nothing is
    // drawn. A number we suggested means the inventory is wrong.
    if (weightKg !== undefined && plan.isSuggestedWeight) {
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
        title="Вес"
        value={weight.value}
        units={weight.units}
        onDecrease={() => stepHandler(-1)}
        onIncrease={() => stepHandler(1)}
        onClose={onCancel}
      >
        {renderBody()}
        <div className={s.links}>
          <button className={s.link} onClick={manualHandler}>
            Ввести вручную
          </button>
          {exercise.load.type !== "none" && (
            <button className={s.link} onClick={() => setInventoryOpen(true)}>
              {!fits && plan.isSuggestedWeight
                ? "Проверить инвентарь"
                : "Мой инвентарь"}
            </button>
          )}
        </div>
      </StepSheet>
      <PageModal isOpen={isInventoryOpen}>
        <WeightsSelector
          exercise={exercise}
          gym={gym}
          onCancel={() => setInventoryOpen(false)}
          onSubmit={inventoryHandler}
        />
      </PageModal>
    </>
  );
}
