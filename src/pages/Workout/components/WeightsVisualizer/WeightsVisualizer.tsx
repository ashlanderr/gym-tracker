import type { EquipmentType, PerformanceWeights } from "../../../../db";
import s from "./styles.module.scss";
import { clsx } from "clsx";
import { RiPlayList2Fill } from "react-icons/ri";
import { LuCircleGauge } from "react-icons/lu";
import { computeWeights } from "../../../../domain";

export interface WeightsVisualizerProps {
  equipment: EquipmentType;
  weights: PerformanceWeights | undefined;
  weightKg: number;
}

export function WeightsVisualizer(props: WeightsVisualizerProps) {
  const { equipment } = props;

  switch (equipment) {
    case "barbell":
      return barbellWeights(props);

    case "dumbbell":
      return dumbbellWeights(props);

    case "machine":
      return machineWeights(props);

    case "plates":
      return platesWeights(props);

    default:
      return null;
  }
}

function barbellWeights({ weights, weightKg }: WeightsVisualizerProps) {
  const ctor = computeWeights(weights, weightKg);
  const isInvalid = !isSameWeight(ctor.totalKg, weightKg);
  const steps: Array<{ weight: number; height: number }> = [];

  for (const step of ctor.steps ?? []) {
    for (let i = 0; i < step.count; ++i) {
      steps.push({
        weight: step.weight,
        height: Math.pow(Math.max(1.25, Math.min(45, step.weight)), 1 / 3) * 35,
      });
    }
  }

  return (
    <div className={clsx(s.barbell, isInvalid && s.invalid)}>
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
        <div className={s.barLabel}>{ctor.base}</div>
      </div>
    </div>
  );
}

function dumbbellWeights({ weights, weightKg }: WeightsVisualizerProps) {
  const ctor = computeWeights(weights, weightKg);
  const isInvalid = !isSameWeight(ctor.totalKg, weightKg);

  const step = ctor.steps?.at(0);
  if (!step) return null;

  const weight = step.weight * step.count;

  let repeat: number[];
  if (ctor.count === 2) {
    repeat = [0, 1];
  } else if (ctor.count === 1) {
    repeat = [0];
  } else {
    return null;
  }

  return (
    <div className={clsx(s.dumbbells, isInvalid && s.invalid)}>
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

function machineWeights({ weights, weightKg }: WeightsVisualizerProps) {
  const ctor = computeWeights(weights, weightKg);
  const baseWeight = ctor.base ?? 0;
  const mainStep = ctor.steps?.at(0) ?? { weight: 0, count: 0 };
  const additionalStep = ctor.steps?.at(1) ?? { weight: 0, count: 0 };
  const mainWeight = mainStep.weight * mainStep.count;
  const additionalWeight = additionalStep.weight * additionalStep.count;

  return (
    <div className={s.machineWeights}>
      <div className={s.machineWeight}>
        <RiPlayList2Fill />
        <span>{baseWeight + mainWeight}</span>
      </div>
      <div className={s.machineWeight}>
        <LuCircleGauge />
        <span>{additionalWeight}</span>
      </div>
    </div>
  );
}

function platesWeights({ weights, weightKg }: WeightsVisualizerProps) {
  const ctor = computeWeights(weights, weightKg);
  const isInvalid = !isSameWeight(ctor.totalKg, weightKg);
  const steps: Array<{ weight: number; height: number }> = [];

  for (const step of ctor.steps ?? []) {
    for (let i = 0; i < step.count; ++i) {
      steps.push({
        weight: step.weight,
        height: Math.pow(Math.max(1.25, Math.min(45, step.weight)), 1 / 3) * 35,
      });
    }
  }

  let repeat: number[];
  if (ctor.count === 2) {
    repeat = [0, 1];
  } else if (ctor.count === 1) {
    repeat = [0];
  } else {
    return null;
  }

  return (
    <div className={clsx(s.platesMachine, isInvalid && s.invalid)}>
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

function isSameWeight(a: number, b: number): boolean {
  return Math.abs(a - b) < 1e-3;
}
