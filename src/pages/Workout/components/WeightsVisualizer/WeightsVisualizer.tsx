import type {
  EquipmentType,
  PerformanceWeights,
  WeightUnits,
} from "../../../../db";
import s from "./styles.module.scss";
import { clsx } from "clsx";
import { computeWeights, type WeightsConstructor } from "../../../../domain";
import { UNITS_SHORT } from "../../../constants.ts";
import { formatNumber } from "../../../../utils";

export interface WeightsVisualizerProps {
  equipment: EquipmentType;
  weights: PerformanceWeights | undefined;
  weightKg: number;
}

const STACK_BRICKS = 11;
const STACK_BELOW_PIN = 3;

export function WeightsVisualizer({
  equipment,
  weights,
  weightKg,
}: WeightsVisualizerProps) {
  const ctor = computeWeights(weights, weightKg);
  const isInvalid = Math.abs(ctor.totalKg - weightKg) >= 1e-3;
  const plates = Array.isArray(weights?.steps) ? weights.steps : [];
  const rackHeight = plateHeight(Math.max(0, ...plates));

  const content = (() => {
    switch (equipment) {
      case "barbell":
        return barbellWeights(ctor, rackHeight);

      case "dumbbell":
        return dumbbellWeights(ctor);

      case "machine":
        return stackWeights(ctor, weights);

      case "plates":
        return platesWeights(ctor, rackHeight);

      default:
        return null;
    }
  })();

  if (!content) return null;

  return <div className={clsx(isInvalid && s.invalid)}>{content}</div>;
}

function expandSteps(ctor: WeightsConstructor): number[] {
  return (ctor.steps ?? []).flatMap((step) =>
    Array.from({ length: step.count }, () => step.weight),
  );
}

function formatUnits(value: number, units: WeightUnits): string {
  return `${formatNumber(value, { maximumFractionDigits: 2 })} ${UNITS_SHORT[units]}`;
}

// The rack keeps the height of the largest plate in the gym, so changing the
// weight never moves the bar.
function barbellWeights(ctor: WeightsConstructor, height: number) {
  const plates = expandSteps(ctor);

  return (
    <div className={s.barbell} style={{ height }}>
      <div className={s.barSpacer} />
      {renderPlates([...plates].reverse(), "left")}
      <div className={clsx(s.plate, s.innerPlate)} />
      <div className={s.barCenter} />
      <div className={clsx(s.plate, s.innerPlate)} />
      {renderPlates(plates, "right")}
      <div className={s.barSpacer} />
      <div className={s.bar}>
        <span className={clsx(s.barLabel, s.num)}>
          {formatUnits(ctor.base ?? 0, ctor.units)}
        </span>
      </div>
    </div>
  );
}

function dumbbellWeights(ctor: WeightsConstructor) {
  const dumbbell = (ctor.totalUnits - (ctor.base ?? 0)) / ctor.count;

  return (
    <div className={s.dumbbells}>
      {Array.from({ length: ctor.count }, (_, i) => (
        <div className={s.dumbbell} key={i}>
          <div className={s.barbell}>
            <div className={s.barSpacer} />
            <div className={clsx(s.plate, s.dumbbellOuter)} />
            <div className={clsx(s.plate, s.dumbbellInner)} />
            <div className={clsx(s.plate, s.innerPlate)} />
            <div className={s.barCenter} />
            <div className={clsx(s.plate, s.innerPlate)} />
            <div className={clsx(s.plate, s.dumbbellInner)} />
            <div className={clsx(s.plate, s.dumbbellOuter)} />
            <div className={s.barSpacer} />
            <div className={s.bar}>
              <span className={clsx(s.barLabel, s.num)}>
                {formatUnits(dumbbell, ctor.units)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// The stack always shows the same bricks and only the pin moves, like on a
// machine. Heavy weights scroll the bricks so a few stay below the pin.
function stackWeights(
  ctor: WeightsConstructor,
  weights: PerformanceWeights | undefined,
) {
  const base = ctor.base ?? 0;
  const tiles = ctor.steps?.find((s) => s.weight === weights?.steps);
  const additional = ctor.steps?.find((s) => s.weight === weights?.additional);
  const pin = tiles?.count ?? 0;
  const stack = base + (tiles ? tiles.weight * tiles.count : 0);
  const extra = additional ? additional.weight * additional.count : 0;
  const offset = Math.max(0, pin - (STACK_BRICKS - STACK_BELOW_PIN - 1));

  return (
    <div className={s.stack}>
      <div className={s.stackTop}>
        <div className={s.stackRod} />
        {extra !== 0 && (
          <div className={s.addChip}>
            <span className={s.num}>+{formatNumber(extra)}</span>
          </div>
        )}
      </div>
      {Array.from({ length: STACK_BRICKS }, (_, i) => {
        const brick = i + offset;
        return (
          <div
            key={i}
            className={clsx(
              s.brick,
              brick < pin && s.lifted,
              brick === pin && s.pick,
            )}
          >
            {brick === pin && (
              <span className={s.num}>{formatUnits(stack, ctor.units)}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function platesWeights(ctor: WeightsConstructor, height: number) {
  const plates = [...expandSteps(ctor)].reverse();

  return (
    <div className={s.platesMachine}>
      {Array.from({ length: ctor.count }, (_, i) => (
        <div className={s.barbell} key={i} style={{ height }}>
          <div className={s.barSpacer} />
          {renderPlates(plates, `side-${i}`)}
          <div className={clsx(s.plate, s.innerPlate)} />
          <div className={s.platesSpacer} />
          <div className={s.platesHolder} />
          <div className={s.bar} />
        </div>
      ))}
    </div>
  );
}

function renderPlates(plates: number[], side: string) {
  return plates.map((weight, i) => (
    <div
      className={s.plate}
      key={`${side}-${i}`}
      style={{ height: plateHeight(weight) }}
    >
      <span className={clsx(s.plateLabel, s.num)}>{formatNumber(weight)}</span>
    </div>
  ));
}

function plateHeight(weight: number): number {
  return Math.pow(Math.max(1.25, Math.min(45, weight)), 1 / 3) * 35;
}
