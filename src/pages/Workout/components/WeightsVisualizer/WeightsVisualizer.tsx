import type { EquipmentType } from "../../../../db/exercises.ts";
import type { WeightsConstructor } from "../Performance/types.ts";
import s from "./styles.module.scss";
import { clsx } from "clsx";
import { RiPlayList2Fill } from "react-icons/ri";
import { LuCircleGauge } from "react-icons/lu";

export function WeightsVisualizer({
  equipment,
  weights,
}: {
  equipment: EquipmentType;
  weights: WeightsConstructor;
}) {
  switch (equipment) {
    case "barbell":
      return barbellWeights(weights);

    case "dumbbell":
      return dumbbellWeights(weights);

    case "machine":
      return machineWeights(weights);

    case "plates":
      return platesWeights(weights);

    default:
      return null;
  }
}

function barbellWeights(weights: WeightsConstructor) {
  const steps: Array<{ weight: number; height: number }> = [];

  for (const step of weights.steps ?? []) {
    for (let i = 0; i < step.count; ++i) {
      steps.push({
        weight: step.weight,
        height: Math.pow(Math.max(1.25, Math.min(45, step.weight)), 1 / 3) * 35,
      });
    }
  }

  return (
    <div className={s.barbell}>
      <div className={s.barSpacer} />
      {[...steps].reverse().map((step, i) => (
        <div className={s.plate} key={i} style={{ height: step.height }}>
          <div className={s.plateLabel}>{step.weight}</div>
        </div>
      ))}
      <div className={clsx(s.plate, s.innerPlate)} />
      <div className={s.barCenter} />
      <div className={clsx(s.plate, s.innerPlate)} />
      {steps.map((step, i) => (
        <div className={s.plate} key={i} style={{ height: step.height }}>
          <div className={s.plateLabel}>{step.weight}</div>
        </div>
      ))}
      <div className={s.barSpacer} />
      <div className={s.bar}>
        <div className={s.barLabel}>{weights.base}</div>
      </div>
    </div>
  );
}

function dumbbellWeights(weights: WeightsConstructor) {
  const weight = weights.steps?.[0]?.weight;
  if (!weight) return null;

  let repeat: number[];
  if (weights.count === 2) {
    repeat = [0, 1];
  } else if (weights.count === 1) {
    repeat = [0];
  } else {
    return null;
  }

  return (
    <div className={s.dumbbells}>
      {repeat.map((r) => (
        <div className={s.dumbbell} key={r}>
          <div className={s.barbell}>
            <div className={s.barSpacer} />
            <div className={s.plate} style={{ height: 50 }} />
            <div className={s.plate} style={{ height: 90 }} />
            <div className={clsx(s.plate, s.innerPlate)} />
            <div className={s.barCenter} />
            <div className={clsx(s.plate, s.innerPlate)} />
            <div className={s.plate} style={{ height: 90 }} />
            <div className={s.plate} style={{ height: 50 }} />
            <div className={s.barSpacer} />
            <div className={s.bar}>
              <div className={s.dumbbellLabel}>{weight}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function machineWeights(weights: WeightsConstructor) {
  const mainWeight = weights.steps?.[0]?.weight ?? 0;
  const additionalWeight = weights.additional ?? 0;

  return (
    <div className={s.machineWeights}>
      <div className={s.machineWeight}>
        <RiPlayList2Fill />
        <span>{mainWeight}</span>
      </div>
      <div className={s.machineWeight}>
        <LuCircleGauge />
        <span>{additionalWeight}</span>
      </div>
    </div>
  );
}

function platesWeights(weights: WeightsConstructor) {
  const steps: Array<{ weight: number; height: number }> = [];

  for (const step of weights.steps ?? []) {
    for (let i = 0; i < step.count; ++i) {
      steps.push({
        weight: step.weight,
        height: Math.pow(Math.max(1.25, Math.min(45, step.weight)), 1 / 3) * 35,
      });
    }
  }

  let repeat: number[];
  if (weights.count === 2) {
    repeat = [0, 1];
  } else if (weights.count === 1) {
    repeat = [0];
  } else {
    return null;
  }

  return (
    <div className={s.platesMachine}>
      {repeat.map((r) => (
        <div className={s.barbell} key={r}>
          <div className={s.barSpacer} />
          {[...steps].reverse().map((step, i) => (
            <div className={s.plate} key={i} style={{ height: step.height }}>
              <div className={s.plateLabel}>{step.weight}</div>
            </div>
          ))}
          <div className={clsx(s.plate, s.innerPlate)} />
          <div className={s.platesSpacer} />
          <div className={s.platesHolder} />
          <div className={s.bar} />
        </div>
      ))}
    </div>
  );
}
