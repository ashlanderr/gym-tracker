import type { EquipmentType } from "../../../../db/exercises.ts";
import s from "./styles.module.scss";
import { clsx } from "clsx";
import { RiPlayList2Fill } from "react-icons/ri";
import { LuCircleGauge } from "react-icons/lu";
import {
  type PerformanceLoadout,
  type PerformanceWeights,
} from "../../../../db/performances.ts";
import {
  BARBELL_BASES,
  BARBELL_DEFAULT_BASE,
  DEFAULT_PLATES,
} from "../constants.ts";
import { computeWeights, kgToUnits, switchItem } from "../utils.ts";

export interface WeightsVisualizerProps {
  equipment: EquipmentType;
  weights: PerformanceWeights | undefined;
  loadout: PerformanceLoadout | undefined;
  weightKg: number;
  onChange: (loadout: PerformanceLoadout) => void;
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

function barbellWeights({
  equipment,
  weights,
  loadout,
  weightKg,
  onChange,
}: WeightsVisualizerProps) {
  if (loadout?.type !== equipment) {
    loadout = undefined;
  }

  if (weights?.auto) {
    loadout = loadout ?? {
      type: equipment,
      base: BARBELL_DEFAULT_BASE[weights.units],
      count: 1,
    };
    weights = {
      auto: true,
      units: weights.units,
      count: 2,
      base: loadout.base,
      steps: DEFAULT_PLATES[weights.units],
      additional: 0,
    };
  }

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

  const switchBaseHandler = () => {
    if (!weights?.auto || !loadout) return;
    onChange({
      ...loadout,
      base: switchItem(BARBELL_BASES[weights.units], loadout.base),
    });
  };

  return (
    <div
      className={clsx(s.barbell, isInvalid && s.invalid)}
      onClick={switchBaseHandler}
    >
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

function dumbbellWeights({
  equipment,
  weights,
  loadout,
  weightKg,
  onChange,
}: WeightsVisualizerProps) {
  if (loadout?.type !== equipment) {
    loadout = undefined;
  }

  if (weights?.auto) {
    loadout = loadout ?? {
      type: equipment,
      base: 0,
      count: 2,
    };
    weights = {
      auto: true,
      units: weights.units,
      count: loadout.count,
      base: loadout.base,
      steps: kgToUnits(weightKg, weights.units) / loadout.count,
      additional: 0,
    };
  }

  const ctor = computeWeights(weights, weightKg);
  const isInvalid = !isSameWeight(ctor.totalKg, weightKg);

  const weight = ctor.steps?.[0]?.weight;
  if (!weight) return null;

  let repeat: number[];
  if (ctor.count === 2) {
    repeat = [0, 1];
  } else if (ctor.count === 1) {
    repeat = [0];
  } else {
    return null;
  }

  const switchCountHandler = () => {
    if (!weights?.auto || !loadout) return;
    onChange({
      ...loadout,
      count: switchItem([1, 2], loadout.count),
    });
  };

  return (
    <div
      className={clsx(s.dumbbells, isInvalid && s.invalid)}
      onClick={switchCountHandler}
    >
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
  if (weights?.auto) return null;

  const ctor = computeWeights(weights, weightKg);
  const baseWeight = ctor.base ?? 0;
  const mainWeight = ctor.steps?.[0]?.weight ?? 0;
  const additionalWeight = ctor.additional ?? 0;

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

function platesWeights({
  equipment,
  weights,
  loadout,
  weightKg,
  onChange,
}: WeightsVisualizerProps) {
  if (loadout?.type !== equipment) {
    loadout = undefined;
  }

  if (weights?.auto) {
    loadout = loadout ?? {
      type: equipment,
      base: 0,
      count: 2,
    };
    weights = {
      auto: true,
      units: weights.units,
      count: loadout.count,
      base: loadout.base,
      steps: DEFAULT_PLATES[weights.units],
      additional: 0,
    };
  }

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

  const switchCountHandler = () => {
    if (!weights?.auto || !loadout) return;
    onChange({
      ...loadout,
      count: switchItem([1, 2], loadout.count),
    });
  };

  return (
    <div
      className={clsx(s.platesMachine, isInvalid && s.invalid)}
      onClick={switchCountHandler}
    >
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
